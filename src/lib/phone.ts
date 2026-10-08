/** Russian phone number as 11 digits starting with 7, or null when it cannot be one. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, '');
  if (d.length === 11 && (d[0] === '7' || d[0] === '8')) return `7${d.slice(1)}`;
  if (d.length === 10) return `7${d}`;
  return null;
}

/** «+7 (912) 345-67-89». Applied on blur, so typing never fights the caret. */
export function formatPhone(digits: string): string {
  const d = digits.slice(1);
  return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
}

/** «+7 (912) ***-**-89»: enough to recognise your own number in the demo summary. */
export function maskPhone(digits: string): string {
  const d = digits.slice(1);
  return `+7 (${d.slice(0, 3)}) ***-**-${d.slice(8, 10)}`;
}
