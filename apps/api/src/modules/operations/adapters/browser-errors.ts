import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { z } from 'zod';

import { logger } from '../../../libs/observability/logging';

const reportSchema = z
  .object({
    kind: z.enum(['error', 'unhandledrejection']),
    errorType: z.enum([
      'Error',
      'TypeError',
      'RangeError',
      'ReferenceError',
      'SyntaxError',
      'URIError',
      'EvalError',
      'Unknown',
    ]),
    // Only a Vite asset basename, never arbitrary URLs, messages or stacks.
    asset: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,100}\.js$/)
      .optional(),
    line: z.number().int().min(0).max(10_000_000).optional(),
    column: z.number().int().min(0).max(10_000_000).optional(),
  })
  .strict();

export function browserErrorReceiver(
  emit = (report: z.infer<typeof reportSchema>) =>
    logger.warn({ event: 'browser.error', ...report }, 'Browser error'),
  now = Date.now,
) {
  let windowStart = now();
  let accepted = 0;
  return (body: unknown): number => {
    const time = now();
    if (time - windowStart >= 60_000) {
      windowStart = time;
      accepted = 0;
    }
    // Global cap bounds logs and memory without trusting proxy/IP headers.
    if (accepted >= 20) return 429;
    const report = reportSchema.safeParse(body);
    if (!report.success) return 400;
    accepted++;
    emit(report.data);
    return 204;
  };
}

@Controller('api/browser-errors')
export class BrowserErrorsController {
  private readonly receive = browserErrorReceiver();
  @Post()
  @HttpCode(204)
  report(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: { status(code: number): void },
  ) {
    response.status(this.receive(body));
  }
}
