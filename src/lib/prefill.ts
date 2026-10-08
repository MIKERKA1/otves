// Hands a helper answer or a calculator estimate to the request form on the same page.
// In memory only: nothing is written to storage or to the URL.
import type { ServiceId } from '../data/pricing.ts';
import { withBase } from './url.ts';

export interface Prefill {
  service?: ServiceId | 'unknown';
  text?: string;
}

export const PREFILL_EVENT = 'otves:prefill';

export function sendToRequest(detail: Prefill): void {
  if (!document.getElementById('zayavka')) {
    location.assign(withBase('/#zayavka'));
    return;
  }
  dispatchEvent(new CustomEvent<Prefill>(PREFILL_EVENT, { detail }));
}
