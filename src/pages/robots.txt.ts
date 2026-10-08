import type { APIRoute } from 'astro';
import { withBase } from '../lib/url.ts';

// Built from SITE_URL, so the sitemap address is right wherever the site is deployed.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('/sitemap-index.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
