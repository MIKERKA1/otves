import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_BYTES, checkHeader, sniff } from '../../src/lib/files.ts';
import { formatPhone, maskPhone, normalizePhone } from '../../src/lib/phone.ts';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const WEBP = new Uint8Array([...'RIFF'].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [...'WEBP'].map((c) => c.charCodeAt(0))));
const PDF = new Uint8Array([...'%PDF-1.7    '].map((c) => c.charCodeAt(0)));

test('sniff recognises images by their first bytes only', () => {
  assert.equal(sniff(JPEG), 'jpeg');
  assert.equal(sniff(PNG), 'png');
  assert.equal(sniff(WEBP), 'webp');
  assert.equal(sniff(PDF), null);
  assert.equal(sniff(new Uint8Array([0xff, 0xd8])), null, 'too short to be a JPEG');
});

test('checkHeader rejects wrong extensions, oversize files and disguised documents', () => {
  assert.deepEqual(checkHeader('kitchen.JPG', 1000, JPEG), { ok: true, kind: 'jpeg' });
  assert.equal(checkHeader('scan.pdf', 1000, PDF).ok, false);
  assert.equal(checkHeader('photo.heic', 1000, JPEG).ok, false, 'HEIC is not accepted even with JPEG bytes');
  assert.equal(checkHeader('report.pdf.jpg', 1000, PDF).ok, false, 'renamed document is caught by content');
  assert.equal(checkHeader('big.png', MAX_BYTES + 1, PNG).ok, false);
  assert.equal(checkHeader('noext', 1000, PNG).ok, false);
});

test('phone numbers normalise to 11 digits starting with 7', () => {
  assert.equal(normalizePhone('+7 (912) 345-67-89'), '79123456789');
  assert.equal(normalizePhone('8 912 345 67 89'), '79123456789');
  assert.equal(normalizePhone('9123456789'), '79123456789');
  assert.equal(normalizePhone('123'), null);
  assert.equal(normalizePhone('+1 212 555 0100'), null);
  assert.equal(formatPhone('79123456789'), '+7 (912) 345-67-89');
  assert.equal(maskPhone('79123456789'), '+7 (912) ***-**-89');
});
