import assert from 'node:assert/strict';
import { test } from 'node:test';

import { classifyPublicRoute } from '../src/public-route-policy';

const id = '01234567-89ab-4cde-8fab-0123456789ab';

void test('prepared public policy distinguishes reader, identity and privileged operations', () => {
  for (const path of [
    '/',
    '/saved',
    '/privacy',
    '/editions',
    `/editions/${id}`,
    '/api/editions/latest',
    `/api/editions/${id}`,
    '/account/login',
    '/account/sign-in',
    '/api/account/session',
    '/healthz',
    '/api/settings/schedule',
    '/api/admin/status/alerts',
  ]) {
    assert.equal(classifyPublicRoute('GET', path), 'public-read', path);
    assert.equal(classifyPublicRoute('HEAD', path), 'public-read', path);
    assert.equal(classifyPublicRoute('DELETE', path), null, path);
  }
  for (const action of ['code', 'redeem', 'link-redeem'])
    assert.equal(
      classifyPublicRoute('POST', `/api/account/${action}`),
      'public-read',
    );
  for (const action of ['sync', 'delete', 'logout', 'logout-all'])
    assert.equal(classifyPublicRoute('POST', `/api/account/${action}`), 'user');
  for (const action of ['links', 'sessions/revoke'])
    assert.equal(
      classifyPublicRoute('POST', `/api/account/${action}`),
      'admin',
    );
  assert.equal(
    classifyPublicRoute('GET', '/api/admin/status?detail=1'),
    'admin',
  );
  assert.equal(classifyPublicRoute('PUT', `/api/admin/topics/${id}`), 'admin');
  assert.equal(
    classifyPublicRoute('POST', '/api/admin/digest-previews/tests'),
    'admin',
  );
});

void test('prepared public policy denies unknown routes, tools and ambiguous router spellings', () => {
  for (const path of [
    '/api/admin/new-feature',
    '/api/account/new-feature',
    '/api/browser-errors',
    '/api/me',
    '/logs',
    '/metrics/api/v1/query',
    '/docs/',
    '/db/',
    '/grafana/',
    '/queues/',
    '/admin',
    '/assets/unknown.js',
    '/API/editions',
    '/api/editions/',
    '/api//editions',
    '/api/./editions',
    '/api/../editions',
    '/api/%65ditions',
    '/api%2feditions',
    '/api\\editions',
    '/api/editions#fragment',
    'https://example.com/api/editions',
    '//api/editions',
    '/api/editions\n',
  ])
    assert.equal(classifyPublicRoute('GET', path), null, path);
  for (const method of ['OPTIONS', 'TRACE', 'CONNECT', 'get', 'POST'])
    assert.equal(classifyPublicRoute(method, '/api/editions'), null, method);
  assert.equal(
    classifyPublicRoute('PUT', '/api/admin/topics/sources/hn-front/enabled'),
    'admin',
  );
  assert.equal(
    classifyPublicRoute('GET', '/api/admin/digest-previews/jobs/123'),
    'admin',
  );
  assert.equal(classifyPublicRoute('GET', '/api/account/sync'), null);
  assert.equal(classifyPublicRoute('GET', '/api/account/links'), null);
  assert.equal(classifyPublicRoute('PUT', '/api/admin/status'), null);
  assert.equal(classifyPublicRoute('GET', '/api/editions/not-a-uuid'), null);
});

void test('unaudited administrative responses remain restricted independently of alert counts', () => {
  for (const path of [
    '/api/admin/profile',
    '/api/admin/topics',
    '/api/admin/topics/sources',
    '/api/admin/content',
    '/api/admin/content/window',
    '/api/admin/content/sources',
    '/api/admin/status',
    '/api/admin/digest-previews',
    '/api/admin/digest-previews/latest',
    `/api/admin/digest-previews/${id}`,
    `/api/admin/digest-previews/${id}/cost`,
    '/api/admin/digest-previews/jobs/123',
  ]) {
    assert.equal(classifyPublicRoute('GET', path), 'admin', path);
    assert.equal(classifyPublicRoute('HEAD', path), 'admin', path);
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH'])
    assert.equal(classifyPublicRoute(method, '/api/admin/status/alerts'), null);
});
