import { PNG, expect, skipBanner, test } from './fixtures';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await skipBanner(page);
  await page.goto('/#zayavka');
});

test('consent is not pre-ticked and an empty submit lists every problem', async ({ page }) => {
  const form = page.locator('#zayavka');
  await expect(form.getByRole('checkbox', { name: /Даю согласие/ })).not.toBeChecked();
  await form.getByRole('button', { name: 'Отправить заявку' }).click();
  const summary = form.getByRole('alert');
  await expect(summary).toBeFocused();
  await expect(summary.locator('li')).toHaveCount(4);
  await expect(form.getByLabel('Как к вам обращаться')).toHaveAttribute('aria-invalid', 'true');
  // Each summary item jumps to its field.
  await summary.getByRole('link', { name: 'Нужен телефон, чтобы перезвонить' }).click();
  await expect(form.getByLabel('Телефон', { exact: true })).toBeFocused();
});

test('phone is checked and formatted on blur', async ({ page }) => {
  const phone = page.getByLabel('Телефон', { exact: true });
  await phone.fill('123');
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await expect(page.locator('#r-phone-error')).toHaveText('Проверьте номер: после +7 должно быть 10 цифр');
  await phone.fill('8 912 345 67 89');
  await phone.blur();
  await expect(phone).toHaveValue('+7 (912) 345-67-89');
  await expect(page.locator('#r-phone-error')).toHaveText('');
});

test('photos are checked by content, extension and count', async ({ page }) => {
  const input = page.locator('[data-photos-input]');
  const error = page.locator('#r-photos-error');
  await input.setInputFiles({ name: 'photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not really an image') });
  await expect(error).toContainText('«photo.jpg»: содержимое не похоже на фото');
  await input.setInputFiles({ name: 'IMG_0001.heic', mimeType: 'image/heic', buffer: PNG });
  await expect(error).toContainText('подходят только фото JPG, PNG или WebP');
  const four = [1, 2, 3, 4].map((n) => ({ name: `leak-${n}.png`, mimeType: 'image/png', buffer: PNG }));
  await input.setInputFiles(four);
  await expect(page.locator('[data-photos] li')).toHaveCount(3);
  await expect(error).toContainText('Можно добавить не больше 3 фото');
  await page.getByRole('button', { name: 'Убрать фото leak-1.png' }).click();
  await expect(page.locator('[data-photos] li')).toHaveCount(2);
});

test('a valid request shows what the company would get, logs nothing, and clears fully', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (m) => logs.push(m.text()));
  const form = page.locator('#zayavka');
  await form.getByLabel('Как к вам обращаться').fill('Тестовая Анна');
  await form.getByLabel('Телефон', { exact: true }).fill('+7 912 345-67-89');
  await form.getByRole('radio', { name: 'Окна' }).check();
  await form.getByLabel('Что случилось или что хотите сделать').fill('Дует из окна в спальне');
  await form.locator('[data-photos-input]').setInputFiles({ name: 'okno.png', mimeType: 'image/png', buffer: PNG });
  await form.getByRole('checkbox', { name: /Даю согласие/ }).check();
  await form.getByRole('button', { name: 'Отправить заявку' }).click();

  const title = form.getByRole('heading', { name: 'Заявка собрана' });
  await expect(title).toBeFocused();
  const summary = form.locator('[data-summary]');
  await expect(summary).toContainText('Тестовая Анна');
  await expect(summary).toContainText('+7 (912) ***-**-89');
  await expect(summary).not.toContainText('345-67');
  await expect(summary).toContainText('без метаданных');
  expect(logs.join('\n')).not.toMatch(/Анна|912|345/);

  await form.getByRole('button', { name: 'Очистить заявку' }).click();
  await expect(form.getByLabel('Как к вам обращаться')).toHaveValue('');
  await expect(form.getByLabel('Как к вам обращаться')).toBeFocused();
  await expect(form.locator('[data-photos] li')).toHaveCount(0);
  await expect(summary).toBeEmpty();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => !k.startsWith('otves.consent')))).toEqual([]);
});

test('service pages carry the form with the service already chosen', async ({ page }) => {
  await page.goto('/uslugi/elektrika/');
  await expect(page.locator('#zayavka').getByRole('radio', { name: 'Электрика' })).toBeChecked();
});
