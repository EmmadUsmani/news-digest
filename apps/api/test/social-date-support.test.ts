import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertSocialDateSupport } from '../src/modules/curation/application/social-date-support';

void test('calendar support accepts source dates across English/French/ISO notation', () => {
  for (const source of [
    'Launch: November 19, 2026.',
    'Sortie le 19 novembre 2026.',
    'Launch: 2026-11-19.',
    '19th Nov. 2026 is the release date.',
  ]) {
    assertSocialDateSupport('Release: Nov 19.', source);
    assertSocialDateSupport('Release: November 19, 2026.', source);
  }
  assertSocialDateSupport('Release: Feb 2.', 'Sortie le 2 février.');
  assertSocialDateSupport('Release: Aug 8.', 'Sortie le 8 août.');
  assertSocialDateSupport('A possible gameplay clip.', 'GTA VI clip.');
});

void test('calendar support refuses absent and changed dates, invented years and URL-only dates', () => {
  for (const [claim, source] of [
    ['Release: Nov 19.', 'Possible GTA VI clip.'],
    ['Release: Nov 19.', 'Release: December 19.'],
    ['Release: Nov 19.', 'Release: Nov 18.'],
    ['Release: Nov 19, 2026.', 'Release: Nov 19.'],
    ['Release: Nov 19, 2026.', 'Release: Nov 19, 2027.'],
    ['Release: Nov 19.', 'Clip https://example.com/2026-11-19/launch'],
    ['Release: Nov 19.', 'Clip www.example.com/2026-11-19/launch'],
    ['Release: Nov 19.', 'Clip example.com/2026-11-19/launch'],
    ['Release: 2026-11-19.', 'Release: 2026-11-18.'],
  ]) {
    assert.throws(() => assertSocialDateSupport(claim, source), {
      message: 'unsupported-social-date',
    });
  }
});
