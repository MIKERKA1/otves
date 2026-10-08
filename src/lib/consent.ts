import { KEYS, readJson, remove, write } from './storage.ts';

export interface Consent {
  v: number;
  analytics: boolean;
  at: number;
}

// Bump VERSION when the list of optional categories changes: everyone is asked again.
const VERSION = 1;
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
export const CONSENT_EVENT = 'otves:consent';
export const TRACK_EVENT = 'otves:track';

function isValid(c: unknown): c is Consent {
  if (!c || typeof c !== 'object') return false;
  const x = c as Record<string, unknown>;
  return x.v === VERSION && typeof x.analytics === 'boolean' && typeof x.at === 'number' && Date.now() - x.at < MAX_AGE_MS;
}

/** The stored choice, or null when the visitor has not chosen yet (or the choice expired). */
export function getConsent(): Consent | null {
  const c = readJson<unknown>(KEYS.consent);
  if (isValid(c)) return c;
  if (c) remove(KEYS.consent);
  return null;
}

export function setConsent(analytics: boolean): Consent {
  const consent: Consent = { v: VERSION, analytics, at: Date.now() };
  write(KEYS.consent, consent);
  applyConsent(consent);
  dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function resetConsent(): void {
  remove(KEYS.consent);
  applyConsent(null);
  remove(KEYS.stats);
  dispatchEvent(new CustomEvent<Consent | null>(CONSENT_EVENT, { detail: null }));
}

let stats: Promise<typeof import('./stats.ts')> | null = null;

/** Loads the stats chunk only when allowed. Withdrawal stops it and deletes what it counted. */
export function applyConsent(consent: Consent | null): void {
  if (consent?.analytics) {
    stats ??= import('./stats.ts');
    void stats.then((m) => m.start());
  } else {
    remove(KEYS.stats);
    void stats?.then((m) => m.stop());
  }
}

/** Components report named events here; nothing happens unless the stats chunk is running. */
export function track(name: 'calculator' | 'helper' | 'request-demo'): void {
  dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: name }));
}
