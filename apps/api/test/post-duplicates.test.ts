import assert from 'node:assert/strict';
import { test } from 'node:test';

import { postDuplicateKey } from '../src/modules/social/adapters/post-duplicate-key';

const caption =
  'Our new game launches today with a playable demo available on all supported platforms.';
const key = (text: string, link = '') =>
  postDuplicateKey(
    `<blockquote><p>${text}${link ? ` <a href="${link}">clip</a>` : ''}</p><footer>Fixture author</footer></blockquote>`,
  );

void test('copied long repost captions share a key only with matching link targets', () => {
  assert.equal(key(caption), key(`RT @studio: ${caption}`));
  assert.equal(
    key(caption, 'https://t.co/one'),
    key(`RT @studio: ${caption}`, 'https://t.co/one'),
  );
  assert.notEqual(
    key(caption, 'https://t.co/one'),
    key(`RT @studio: ${caption}`, 'https://t.co/two'),
  );
  assert.notEqual(key('Great play!'), key('RT @nba: Great play!'));
});

void test('duplicate keys preserve distinct claims, media links and meaningful symbols', () => {
  assert.notEqual(key('AI revenue +5%'), key('AI revenue -5%'));
  assert.notEqual(key('AI model 5.5'), key('AI model 55'));
  assert.notEqual(key(caption), key(caption.replace('today', 'tomorrow')));
  assert.notEqual(
    key(caption),
    key(caption.replace('available', 'not available')),
  );
  assert.notEqual(
    key('What a play!', 'https://t.co/one'),
    key('What a play!', 'https://t.co/two'),
  );
  assert.equal(
    key('AI launch', 'https://example.com/?a=1&amp;b=2'),
    key('AI launch', 'https://example.com/?a=1&b=2'),
  );
});
