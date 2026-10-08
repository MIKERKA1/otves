// Optional anonymous statistics. A separate chunk, imported by consent.ts only after consent.
// Counts page views and a few named events. No identifiers, no form contents, no cookies.
import { KEYS, readJson, remove, write } from './storage.ts';
import { TRACK_EVENT } from './consent.ts';

const TRACKED = ['calculator', 'helper', 'request-demo'] as const;
type TrackName = (typeof TRACKED)[number];

export interface Stats {
  since: number;
  views: Record<string, number>;
  events: Partial<Record<TrackName, number>>;
}

const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const endpoint: string | undefined = import.meta.env.PUBLIC_STATS_ENDPOINT;

let running = false;

function load(): Stats {
  const s = readJson<Stats>(KEYS.stats);
  if (!s || typeof s.since !== 'number' || Date.now() - s.since > RETENTION_MS) {
    return { since: Date.now(), views: {}, events: {} };
  }
  return { since: s.since, views: s.views ?? {}, events: s.events ?? {} };
}

function send(payload: { path: string; event?: TrackName }) {
  if (!endpoint) return;
  try {
    navigator.sendBeacon(endpoint, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  } catch {
    /* best effort */
  }
}

function onTrack(e: Event) {
  const name = (e as CustomEvent<unknown>).detail;
  if (!running || !TRACKED.includes(name as TrackName)) return;
  const s = load();
  s.events[name as TrackName] = (s.events[name as TrackName] ?? 0) + 1;
  write(KEYS.stats, s);
  send({ path: location.pathname, event: name as TrackName });
}

export function start(): void {
  if (running) return;
  running = true;
  const s = load();
  s.views[location.pathname] = (s.views[location.pathname] ?? 0) + 1;
  write(KEYS.stats, s);
  send({ path: location.pathname });
  addEventListener(TRACK_EVENT, onTrack);
}

export function stop(): void {
  running = false;
  removeEventListener(TRACK_EVENT, onTrack);
  remove(KEYS.stats);
}
