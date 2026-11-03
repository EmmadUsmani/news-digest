import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import https from 'node:https';
import { Readable } from 'node:stream';
import { mock, test } from 'node:test';

import type { Job } from 'bullmq';

import { createLogger, logJob } from '../src/libs/observability/logging';
import { SharedHttpClient } from '../src/libs/ports/http.client';

void test('shared HTTP logs actual attempts, status, failures and job context without URLs or bodies', async () => {
  const lines: string[] = [];
  const log = createLogger(
    'test',
    {
      write: (line: string) => {
        lines.push(line);
      },
    },
    [],
  );
  let status = 200;
  let transportFailure = false;
  const requestMock = mock.method(
    https,
    'request',
    (
      _url: string,
      _options: unknown,
      callback: (response: unknown) => void,
    ) => {
      const req = new EventEmitter();
      Object.assign(req, {
        end: () =>
          queueMicrotask(() => {
            if (transportFailure)
              req.emit('error', new Error('private-provider-body'));
            else
              callback(
                Object.assign(
                  Readable.from([Buffer.from('private-provider-body')]),
                  {
                    statusCode: status,
                    headers:
                      status === 302
                        ? { location: 'https://other.org/feed' }
                        : {},
                  },
                ),
              );
          }),
      });
      return req;
    },
  );
  const url = 'https://publisher.org/feed?credential=private-query';
  try {
    const client = new SharedHttpClient(log);
    await logJob(
      'ingestion',
      () => client.get(url),
      log,
    )({ id: 'job-123', name: 'feed', attemptsMade: 0 } as Job);
    await client.get(url); // Cache reuse must not claim another external call.
    status = 429;
    await assert.rejects(new SharedHttpClient(log).get(url), /HTTP 429/);
    status = 302;
    // Both the redirect and its failing destination must be visible.
    let count = 0;
    requestMock.mock.mockImplementation(
      (
        _url: string,
        _options: unknown,
        callback: (response: unknown) => void,
      ) => {
        const req = new EventEmitter();
        Object.assign(req, {
          end: () =>
            queueMicrotask(() =>
              callback(
                Object.assign(Readable.from(['body']), {
                  statusCode: count++ === 0 ? 302 : 503,
                  headers: { location: 'https://other.org/feed' },
                }),
              ),
            ),
        });
        return req;
      },
    );
    await assert.rejects(new SharedHttpClient(log).get(url), /HTTP 503/);
    requestMock.mock.restore();
    const failureMock = mock.method(https, 'request', () => {
      throw new Error('private-provider-body');
    });
    transportFailure = true;
    try {
      await assert.rejects(
        new SharedHttpClient(log).get(url),
        /private-provider-body/,
      );
    } finally {
      failureMock.mock.restore();
    }
    const calls = lines
      .map((line) => JSON.parse(line))
      .filter((line) => line.event === 'external.call');
    assert.deepEqual(
      calls.map((line) => [line.status, line.outcome]),
      [
        [200, 'success'],
        [429, 'failure'],
        [302, 'redirect'],
        [503, 'failure'],
        [undefined, 'failure'],
      ],
    );
    assert.equal(calls[0].jobId, 'job-123');
    assert.equal(calls[0].queue, 'ingestion');
    assert.ok(
      calls.every((line) => line.durationMs >= 0 && line.target === 'feed'),
    );
    assert.ok(!lines.join('').includes('private-'));
    assert.ok(!lines.join('').includes('publisher.org'));
  } finally {
    requestMock.mock.restore();
  }
});
