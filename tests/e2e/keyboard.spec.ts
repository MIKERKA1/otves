import { expect, isMobile, skipBanner, test } from './fixtures';

test.use({ reducedMotion: 'reduce' });

const focusedOutline = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return 'none';
    const own = getComputedStyle(el);
    // Hidden radios and file inputs show focus on their visible label instead.
    const shown = own.opacity === '0' || el.classList.contains('visually-hidden') ? getComputedStyle(el.closest('label') ?? el) : own;
    return shown.outlineStyle !== 'none' ? shown.outlineStyle : getComputedStyle(el.nextElementSibling ?? el).outlineStyle;
  });

test('keyboard only: skip link, cookie banner, header, theme', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Перейти к содержимому' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  // The banner sits right after the skip link, so it is reached before anything else.
  const reject = page.getByRole('button', { name: 'Только необходимые' }).first();
  for (let i = 0; i < 6 && !(await reject.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(reject).toBeFocused();
  expect(await focusedOutline(page)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Cookie и данные в браузере' })).toBeHidden();
  await expect(page.getByRole('link', { name: 'Отвес, на главную' })).toBeFocused();

  // Theme toggle with Space.
  const toggle = page.locator('.header [data-theme-toggle]');
  if (await toggle.isVisible()) {
    for (let i = 0; i < 12 && !(await toggle.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
    expect(await page.evaluate(() => localStorage.getItem('otves.theme'))).toMatch(/dark|light/);
  }
});

test('skip link moves focus to the main content', async ({ page }) => {
  await skipBanner(page);
  await page.goto('/uslugi/okna/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBe(true);
});

test('mobile menu: opens, keeps focus inside, closes on Escape, returns focus', async ({ page }) => {
  await skipBanner(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Меню' });
  await button.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('dialog', { name: 'Меню сайта' });
  await expect(menu).toBeVisible();
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Shift+Tab');
    const outside = await page.evaluate(() => {
      const a = document.activeElement;
      return !!a && a !== document.body && !a.closest('dialog[open]');
    });
    expect(outside).toBe(false);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(button).toBeFocused();

  // A section link closes the menu and puts focus on that section's heading.
  await page.keyboard.press('Enter');
  await menu.getByRole('link', { name: 'Работы' }).focus();
  await page.keyboard.press('Enter');
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#raboty$/);
  await expect(page.getByRole('heading', { name: 'Как это выглядит вживую' })).toBeFocused();
});

test('radio groups move with arrow keys and show focus', async ({ page }) => {
  await skipBanner(page);
  await page.goto('/');
  const first = page.locator('#raschet input[name="service"][value="remont"]');
  await first.focus();
  expect(await focusedOutline(page)).not.toBe('none');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#raschet input[name="service"][value="potolki"]')).toBeChecked();
  await expect(page.locator('#raschet [data-group="potolki"]')).toBeVisible();
});

test('helper is fully usable from the keyboard', async ({ page }) => {
  await skipBanner(page);
  await page.goto('/');
  const helper = page.locator('#pomoshnik');
  await helper.getByRole('button', { name: 'Окна и балкон' }).focus();
  await page.keyboard.press('Enter');
  await expect(helper.getByRole('heading', { name: 'Что именно случилось?' }).first()).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(helper.getByRole('heading', { name: 'Регулировка и проверка шва' })).toBeFocused();
  // «Начать сначала» brings back the first question.
  await helper.getByRole('button', { name: 'Начать сначала' }).locator('visible=true').focus();
  await page.keyboard.press('Enter');
  await expect(helper.getByRole('heading', { name: 'Где проблема?' })).toBeFocused();
});

test('pages are reachable between each other from the keyboard', async ({ page }) => {
  await skipBanner(page);
  await page.goto('/');
  const link = page.locator('footer').getByRole('link', { name: 'Политика конфиденциальности' });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Политика конфиденциальности');
  if (!isMobile(page)) {
    await page.locator('.legal__aside').getByRole('link', { name: 'Ваши данные и их удаление' }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/data\/$/);
  }
});
