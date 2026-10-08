// The only place that touches localStorage. Every key the site may write is listed here,
// so the «Ваши данные» page can show and delete all of them.

export const KEYS = {
  consent: 'otves.consent',
  theme: 'otves.theme',
  stats: 'otves.stats',
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

// Private mode, blocked storage or a full quota must never break the page.
export function readRaw(key: StorageKey): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readJson<T>(key: StorageKey): T | null {
  const raw = readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function write(key: StorageKey, value: string | object): void {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    /* storage unavailable: the choice lives until the tab closes */
  }
}

export function remove(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* nothing to remove */
  }
}

export function removeAll(): void {
  for (const key of Object.values(KEYS)) remove(key);
}
