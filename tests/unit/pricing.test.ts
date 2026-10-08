import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateElektrika,
  estimateOkna,
  estimatePotolki,
  estimateRemont,
  estimateSantehnika,
  roundRange,
} from '../../src/data/pricing.ts';

test('roundRange picks a step that fits the amount', () => {
  assert.deepEqual(roundRange([1234, 5678]), [1200, 5700]);
  assert.deepEqual(roundRange([12_340, 56_780]), [12_000, 57_000]);
  assert.deepEqual(roundRange([123_400, 567_800]), [123_000, 568_000]);
});

test('remont: rate times area, extras depend on the level', () => {
  const base = { area: 54, level: 'cosmetic', bathroom: 'none', demolition: false, materials: false, debris: false } as const;
  assert.deepEqual(estimateRemont(base).total, [243_000, 351_000]);

  const turnkey = estimateRemont({ ...base, level: 'turnkey', demolition: true, materials: true, debris: true });
  assert.equal(turnkey.lines.length, 1, 'turnkey already includes demolition, materials and debris');
  assert.deepEqual(turnkey.total, [756_000, 1_026_000]);

  const bath = estimateRemont({ ...base, bathroom: 'combined' });
  assert.deepEqual(bath.lines[1]?.range, [35_000, 60_000], 'cosmetic bathroom costs half');

  const small = estimateRemont({ ...base, area: 20, debris: true });
  assert.deepEqual(small.lines.at(-1)?.range, [8_000, 12_000], 'debris removal has a minimum');
});

test('potolki: per-room minimum applies to small rooms', () => {
  const one = estimatePotolki({ area: 18, rooms: 1, finish: 'matte', spots: 0, chandeliers: 0, shadow: false });
  assert.deepEqual(one.total, [11_500, 15_500]);
  const tiny = estimatePotolki({ area: 6, rooms: 3, finish: 'matte', spots: 0, chandeliers: 0, shadow: false });
  assert.deepEqual(tiny.total, [12_000, 13_500]);
});

test('okna: warm profile costs 25% more', () => {
  const e = estimateOkna({ regular: 2, triple: 0, balcony: 0, warm: true, slopes: false, sills: false, nets: false });
  assert.deepEqual(e.total, [45_000, 65_000]);
});

test('santehnika and elektrika respect the minimum order, empty input is zero', () => {
  const zero = { mixer: 0, toilet: 0, installation: 0, sink: 0, bath: 0, shower: 0, appliance: 0, towel: 0, piping: false };
  assert.deepEqual(estimateSantehnika({ ...zero, mixer: 1 }).total, [2_000, 2_500]);
  assert.deepEqual(estimateSantehnika(zero).total, [0, 0]);

  const wiring = estimateElektrika({ full: true, area: 54, outlets: 0, newPoints: 0, spots: 0, chandeliers: 0, panel: false });
  assert.deepEqual(wiring.total, [102_000, 141_000]);
});

test('garbage input is clamped, not propagated as NaN', () => {
  const e = estimateRemont({ area: Number.NaN, level: 'capital', bathroom: 'none', demolition: false, materials: false, debris: false });
  assert.deepEqual(e.total, [90_000, 125_000]);
});
