import { expect, skipBanner, test } from './fixtures';

test.use({ reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await skipBanner(page);
  await page.goto('/');
});

test('plan: chips and the drawing share one state', async ({ page }) => {
  const hero = page.locator('.hero');
  await hero.getByRole('radio', { name: 'Окна' }).check();
  await expect(hero.locator('[data-callout="okna"]')).toBeVisible();
  await expect(hero.locator('[data-callout="okna"]')).toContainText('от 18 000');
  await hero.getByRole('radio', { name: 'Сантехника' }).check();
  // Clicking a window on the drawing selects «Окна» again.
  await hero.locator('.plan__windows rect').first().click({ force: true });
  await expect(hero.getByRole('radio', { name: 'Окна' })).toBeChecked();
});

test('services: arrow keys switch between panels', async ({ page }) => {
  const remont = page.locator('input[name="svc"][value="remont"]');
  await remont.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('input[name="svc"][value="potolki"]')).toBeChecked();
  await expect(page.locator('[data-svc="potolki"]')).toBeVisible();
  await expect(page.locator('[data-svc="remont"]')).toBeHidden();
});

test('helper: problem to answer to a prefilled request', async ({ page }) => {
  const helper = page.locator('#pomoshnik');
  await helper.getByRole('button', { name: 'Вода, трубы, сантехника' }).click();
  await helper.getByRole('button', { name: 'Течёт под раковиной или ванной' }).click();
  await expect(helper.getByRole('heading', { name: 'Поиск и устранение протечки' })).toBeFocused();
  await expect(helper.getByText('перекройте краны на трубах прямо сейчас')).toBeVisible();
  await helper.getByRole('button', { name: 'Оставить заявку с этим описанием' }).click();
  const form = page.locator('#zayavka');
  await expect(form.getByLabel('Что случилось или что хотите сделать')).toHaveValue(/Течёт под раковиной/);
  await expect(form.getByRole('radio', { name: 'Сантехника' })).toBeChecked();
  await expect(form.getByLabel('Как к вам обращаться')).toBeFocused();
});

test('calculator: a range, a disclaimer, and the estimate goes into the request', async ({ page }) => {
  const calc = page.locator('#raschet');
  const total = calc.locator('[data-total]');
  await expect(total).toHaveText(/\d.*₽/);
  await expect(calc.getByText('Это ориентир, а не цена договора')).toBeVisible();

  await calc.getByRole('radio', { name: 'Окна' }).check();
  const before = await total.textContent();
  await calc.getByRole('button', { name: 'Больше: двустворчатых окон' }).click();
  await expect(total).not.toHaveText(before ?? '');
  await expect(calc.locator('[data-lines]')).toContainText('Двустворчатое окно, 3 шт.');

  await calc.getByRole('button', { name: 'Отправить расчёт в заявку' }).click();
  await expect(page.locator('#r-desc')).toHaveValue(/Расчёт на сайте: Двустворчатое окно, 3 шт\./);
  await expect(page.locator('#zayavka').getByRole('radio', { name: 'Окна' })).toBeChecked();
});

test('calculator: «уже входит» extras are ticked and locked', async ({ page }) => {
  const calc = page.locator('#raschet');
  await calc.getByRole('radio', { name: 'Под ключ' }).check();
  const debris = calc.getByRole('checkbox', { name: /Вывоз мусора/ });
  await expect(debris).toBeChecked();
  await expect(debris).toBeDisabled();
  await calc.getByRole('radio', { name: 'Косметический' }).check();
  await expect(debris).toBeEnabled();
});

test('a link like /#raschet-santehnika preselects the service', async ({ page }) => {
  await page.goto('/#raschet-santehnika');
  await expect(page.locator('#raschet input[name="service"][value="santehnika"]')).toBeChecked();
  await expect(page.locator('#raschet [data-group="santehnika"]')).toBeVisible();
});

test('before/after slider moves with the keyboard', async ({ page }) => {
  const range = page.locator('[data-ba-range]');
  await range.focus();
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
  await expect(range).toHaveAttribute('aria-valuetext', 'Слева 60% фото до ремонта, справа после');
  expect(await page.locator('[data-ba]').evaluate((el) => el.style.getPropertyValue('--pos'))).toBe('60%');
  await page.keyboard.press('Home');
  await expect(range).toHaveAttribute('aria-valuetext', 'Целиком фото после ремонта');
});

test('case dialog keeps focus inside and gives it back', async ({ page }) => {
  const opener = page.getByRole('button', { name: 'Ванная с окном, переделанная с нуля' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Ванная с окном, переделанная с нуля' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Демо-кейс');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    // Focus may rest on the browser chrome between cycles, but never on the page behind the dialog.
    const outside = await page.evaluate(() => {
      const a = document.activeElement;
      return !!a && a !== document.body && !a.closest('dialog[open]');
    });
    expect(outside).toBe(false);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('schedule redraws for another scenario', async ({ page }) => {
  const workBar = page.locator('.gantt__bar').nth(5);
  const before = await workBar.getAttribute('width');
  await page.locator('#etapy').getByRole('radio', { name: 'Ремонт квартиры' }).check();
  await expect.poll(() => workBar.getAttribute('width')).not.toBe(before);
  await expect(page.locator('#etapy .gantt__dur', { hasText: /^3 месяца$/ })).toBeVisible();
});

test('FAQ answers open with the keyboard', async ({ page }) => {
  const first = page.locator('#voprosy summary').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#voprosy details').first()).toHaveAttribute('open', '');
});
