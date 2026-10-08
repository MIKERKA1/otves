import { expect, test } from './fixtures';

const STATS_CHUNK = /\/_astro\/stats\.[\w-]+\.js/;

test('banner shows on first visit and nothing optional loads before a choice', async ({ page }) => {
  const statsRequests: string[] = [];
  page.on('request', (r) => STATS_CHUNK.test(r.url()) && statsRequests.push(r.url()));
  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Cookie и данные в браузере' });
  await expect(banner).toBeVisible();
  // Reject and accept carry the same visual weight: both are solid dark buttons.
  const reject = banner.getByRole('button', { name: 'Только необходимые' });
  const accept = banner.getByRole('button', { name: 'Разрешить статистику' });
  expect(await reject.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(await accept.evaluate((el) => getComputedStyle(el).backgroundColor));

  await reject.click();
  await expect(banner).toBeHidden();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('otves.consent') ?? 'null'));
  expect(stored).toMatchObject({ v: 1, analytics: false });

  await page.reload();
  await expect(banner).toBeHidden();
  expect(statsRequests).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('otves.stats'))).toBeNull();
});

test('allowing statistics loads the module; withdrawing it deletes the counters', async ({ page }) => {
  await page.goto('/');
  const chunk = page.waitForRequest(STATS_CHUNK);
  await page.getByRole('button', { name: 'Разрешить статистику' }).click();
  await chunk;
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('otves.stats') ?? '{}').views?.['/'])).toBe(1);

  await page.getByRole('button', { name: 'Настройки cookie' }).click();
  const dialog = page.getByRole('dialog', { name: 'Настройки cookie' });
  await expect(dialog).toBeVisible();
  const stats = dialog.getByRole('checkbox', { name: 'Статистика' });
  await expect(stats).toBeChecked();
  await stats.uncheck();
  await dialog.getByRole('button', { name: 'Сохранить выбор' }).click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('otves.stats'))).toBeNull();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('otves.consent')!).analytics)).toBe(false);
});

test('the site makes no third-party requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol.startsWith('http')) origins.add(url.origin);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Разрешить статистику' }).click();
  for (const id of ['uslugi', 'raschet', 'raboty', 'etapy', 'zayavka']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  await page.goto('/uslugi/okna/');
  expect([...origins]).toEqual([new URL(page.url()).origin]);
});

test('settings dialog: focus moves in, Escape closes without saving, focus comes back', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Настройки cookie' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Настройки cookie' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('otves.consent'))).toBeNull();
});

test('a choice older than 12 months is asked again', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('otves.consent', JSON.stringify({ v: 1, analytics: true, at: Date.now() - 366 * 864e5 }));
  });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Cookie и данные в браузере' })).toBeVisible();
});

test('«Ваши данные» lists what is stored and deletes all of it', async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('otves.consent', JSON.stringify({ v: 1, analytics: false, at: Date.now() }));
    localStorage.setItem('otves.theme', 'dark');
  });
  await page.goto('/data/');
  const rows = page.locator('[data-stored-rows] tr');
  await expect(rows).toHaveCount(2);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Удалить всё и сбросить настройки' }).click();
  await expect(page.getByText('Ничего. Сайт ничего не сохранил в этом браузере.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Cookie и данные в браузере' })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('otves.')))).toEqual([]);
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});
