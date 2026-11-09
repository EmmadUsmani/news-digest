import 'reflect-metadata';

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BadRequestException,
  Controller,
  Get,
  Module,
  Post,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { PublicErrorFilter } from '../src/public-write/public-error-filter';

void test('public Nest failures preserve status without exposing submitted or internal details', async () => {
  let writes = 0;
  @Controller('api/probe')
  class ProbeController {
    @Get()
    read() {
      throw new Error('private-database-credential');
    }
    @Post()
    write() {
      writes++;
      throw new BadRequestException('private-validation-detail');
    }
  }
  @Module({ controllers: [ProbeController] })
  class ProbeModule {}
  const app = await NestFactory.create(ProbeModule, { logger: false });
  app.useGlobalFilters(new PublicErrorFilter());
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  try {
    for (const [path, method, body, status] of [
      ['/api/probe', 'GET', undefined, 500],
      ['/api/probe', 'HEAD', undefined, 500],
      ['/api/probe', 'POST', '{}', 400],
      ['/api/probe', 'POST', '{"private-submitted-code":', 400],
      [
        '/api/probe',
        'POST',
        JSON.stringify({ data: 'x'.repeat(110_000) }),
        413,
      ],
      ['/api/missing', 'GET', undefined, 404],
    ] as const) {
      const response = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(await response.text(), '');
    }
    assert.equal(
      writes,
      1,
      'invalid and oversized JSON never enters controller',
    );
  } finally {
    await app.close();
  }
});
