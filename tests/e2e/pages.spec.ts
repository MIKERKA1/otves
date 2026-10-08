import AxeBuilder from '@axe-core/playwright';
import { PAGES, expect, skipBanner, test } from './fixtures';

const axeReport = async (page: import('@playwright/test').Page) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
};

for (const path of PAGES) {
  test(`${path}: loads, has SEO basics, no console or CSP errors, passes axe`, async ({ page, errors }) => {
    await skipBanner(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Отвес/);
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toMatch(/^https?:\/\//);
    expect(await page.locator('meta[http-equiv="content-security-policy"]').count()).toBe(1);
    // Let the entrance animation finish so contrast is measured on final colours.
    await page.waitForTimeout(2600);
    expect(await axeReport(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('dark theme passes axe on the home page and a service page', async ({ page }) => {
  await skipBanner(page);
  await page.emulateMedia({ colorScheme: 'dark' });
  for (const path of ['/', '/uslugi/okna/', '/data/']) {
    await page.goto(path);
    await page.waitForTimeout(2600);
    expect(await axeReport(page), path).toEqual([]);
  }
});

test('no horizontal overflow from 320 px to desktop', async ({ page }) => {
  await skipBanner(page);
  for (const width of [320, 375, 414, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of ['/', '/uslugi/okna/', '/privacy/', '/data/']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test('every internal link and anchor resolves', async ({ page, request }) => {
  await skipBanner(page);
  const links = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.$$eval('a[href^="/"], a[href^="#"]', (as) => as.map((a) => (a as HTMLAnchorElement).href));
    hrefs.forEach((h) => links.add(h));
  }
  const pages = new Set([...links].map((l) => l.split('#')[0]!));
  for (const url of pages) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
  }
  // Anchors such as /#raschet must point at an element that exists.
  for (const url of [...links].filter((l) => l.includes('#') && !l.endsWith('#'))) {
    const [base, hash] = url.split('#');
    await page.goto(base!);
    const id = decodeURIComponent(hash!);
    const exists = id.startsWith('raschet-') ? await page.locator('#raschet').count() : await page.locator(`[id="${id}"]`).count();
    expect(exists, url).toBeGreaterThan(0);
  }
});

test('404, robots.txt and sitemap', async ({ page, request }) => {
  const res = await page.goto('/net-takoy-stranicy/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Такой страницы нет');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('sitemap-index.xml');
  const sitemap = await request.get('/sitemap-index.xml');
  expect(sitemap.status()).toBe(200);
});
