import assert from 'node:assert/strict';
import test from 'node:test';

import { publicArticleOrigin } from '../src/public-read/article-link';
import { classifyPublicRoute } from '../src/public-route-policy';

void test('public article display keeps only normalized publisher origins', () => {
  const privateValue = 'private-subscription-token';
  for (const url of [
    `https://Publisher.com/${privateValue}?article=123&token=${privateValue}#${privateValue}`,
    `https://publisher.com/redirect?url=https%3A%2F%2Fprivate.example%2F${privateValue}`,
    `https://publisher.com/%2f%2f${privateValue}%40private.example?${privateValue}`,
    `https://publisher.com:443/story/${privateValue}`,
  ]) {
    assert.equal(publicArticleOrigin(url), 'https://publisher.com');
    assert.equal(
      JSON.stringify(publicArticleOrigin(url)).includes(privateValue),
      false,
    );
  }
  assert.equal(
    publicArticleOrigin('https://bücher.de/article?q=private'),
    'https://xn--bcher-kva.de',
  );
});

void test('ineligible or malformed stored links have no public origin or fallback', () => {
  for (const value of [
    null,
    undefined,
    {},
    42,
    '',
    'not a URL private-token',
    'https://user:private-token@publisher.com/story',
    'http://publisher.com/story',
    'javascript:alert(1)',
    'https://publisher.com:8443/story',
    'https://publisher.com./story',
    'https://localhost/story',
    'https://service.internal/story',
    'https://127.1/story',
    'https://0x7f000001/story',
    'https://169.254.169.254/story',
    'https://[::1]/story',
    'https://[::ffff:127.0.0.1]/story',
  ])
    assert.equal(publicArticleOrigin(value), null);
});

void test('origin preparation leaves unaudited article transports restricted', () => {
  for (const method of ['GET', 'HEAD']) {
    for (const path of ['/api/admin/content', '/api/admin/content/window'])
      assert.equal(classifyPublicRoute(method, path), 'admin');
  }
});
