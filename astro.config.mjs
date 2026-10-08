import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { createHash } from 'node:crypto';
import { THEME_INIT } from './src/lib/theme-init.mjs';

const sha256 = (text) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

// PUBLIC_STATS_ENDPOINT is optional: without it the consented stats stay in the browser.
const statsOrigin = process.env.PUBLIC_STATS_ENDPOINT ? new URL(process.env.PUBLIC_STATS_ENDPOINT).origin : '';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://otves.example',
  // GitHub Pages serves the site from /<repo>/; the deploy workflow passes that prefix.
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  // The dev toolbar sits under the sticky mobile bar and Safari's bottom UI, and is dev-only anyway.
  devToolbar: { enabled: false },
  // Astro 7 defaults to JSX whitespace rules, which glue Russian words around inline links.
  compressHTML: true,
  // No Markdown code blocks on this site; Shiki's inline styles would also clash with the CSP.
  markdown: { syntaxHighlight: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: blob:",
        "font-src 'self'",
        `connect-src 'self'${statsOrigin ? ` ${statsOrigin}` : ''}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
      ],
      scriptDirective: { resources: ["'self'"], hashes: [sha256(THEME_INIT)] },
      styleDirective: { resources: ["'self'"] },
    },
  },
});
