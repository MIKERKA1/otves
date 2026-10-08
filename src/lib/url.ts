/** Prefixes a root path with the deploy base, e.g. '/otves' on GitHub Pages; a no-op when the site is served from '/'. */
export const withBase = (path: string): string => import.meta.env.BASE_URL.replace(/\/$/, '') + path;
