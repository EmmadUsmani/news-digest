import type { IncomingMessage, ServerResponse } from 'node:http';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

// Prepared export transport only. Admission stays closed until proxy composition
// and installed-browser acceptance are complete.
export const telemetryExportPath = '/metrics/prometheus/api/v1/export';
const maximumBytes = 64 * 1024;

export function boundedTelemetryExport(target: string): string | null {
  if (
    target.length > 1024 ||
    /[#\\\s]/.test(target) ||
    !target.startsWith(`${telemetryExportPath}?`)
  )
    return null;
  const url = new URL(target, 'http://localhost');
  if (url.pathname !== telemetryExportPath) return null;
  const params = url.searchParams;
  if (
    [...params.keys()].some((key) => !['match[]', 'start', 'end'].includes(key))
  )
    return null;
  for (const key of ['match[]', 'start', 'end'])
    if (params.getAll(key).length !== 1) return null;
  // Deliberately begin with one low-cardinality metric, no regex/selectors.
  if (params.get('match[]') !== 'up') return null;
  const startText = params.get('start')!;
  const endText = params.get('end')!;
  if (
    ![startText, endText].every((value) => /^\d{1,10}(\.\d{1,3})?$/.test(value))
  )
    return null;
  const start = Number(startText);
  const end = Number(endText);
  if (end <= start || end - start > 60) return null;
  params.set('max_rows_per_line', '1');
  params.set('reduce_mem_usage', '1');
  // Enforced by VictoriaMetrics GetContextForExport, independently of the
  // downstream transport deadline. Callers cannot override this value.
  params.set('timeout', '2s');
  return `${telemetryExportPath}?${params}`;
}

// Buffer before forwarding: a partial oversized export must never become a
// successful downstream response. Destroy the request on overflow, deadline or caller
// disconnect, including while headers or a body chunk are stalled.
export async function readBoundedTelemetryExport(
  url: URL,
  signal: AbortSignal,
  timeoutMs = 5000,
): Promise<Buffer> {
  if (signal.aborted) throw new Error('Telemetry export cancelled');
  const request =
    url.protocol === 'http:'
      ? httpRequest
      : url.protocol === 'https:'
        ? httpsRequest
        : null;
  if (!request) throw new Error('Invalid telemetry export protocol');
  // A one-shot socket avoids pooled fetch reconnects during cancellation.
  // Reject directly as well as destroying the socket: settlement must not
  // depend on a response-body reader noticing an abort.
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort = () => {};
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      const upstream = request(url, {
        agent: false,
        headers: { 'Accept-Encoding': 'identity' },
      });
      const fail = (error: Error) => {
        reject(error);
        upstream.destroy();
      };
      abort = () => fail(new Error('Telemetry export cancelled'));
      signal.addEventListener('abort', abort, { once: true });
      timer = setTimeout(
        () => fail(new Error('Telemetry export deadline exceeded')),
        timeoutMs,
      );
      upstream.once('error', fail);
      upstream.once('response', (response) => {
        response.once('error', fail);
        if (
          !response.statusCode ||
          response.statusCode < 200 ||
          response.statusCode >= 300 ||
          !/application\/.*json/i.test(
            response.headers['content-type'] ?? '',
          ) ||
          response.headers['set-cookie']
        ) {
          fail(new Error('Invalid telemetry export response'));
          return;
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        response.on('data', (chunk: Buffer) => {
          bytes += chunk.length;
          if (bytes > maximumBytes) {
            fail(new Error('Telemetry export exceeds byte limit'));
            return;
          }
          chunks.push(chunk);
        });
        response.once('end', () => resolve(Buffer.concat(chunks, bytes)));
      });
      if (signal.aborted) abort();
      else upstream.end();
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}

// Prepared HTTP composition only: this is deliberately not wired into route
// admission. Authentication and upstream work limits remain separate gates.
export async function proxyBoundedTelemetryExport(
  req: IncomingMessage,
  res: ServerResponse,
  origin: URL,
  timeoutMs = 5000,
): Promise<void> {
  res.setHeader('cache-control', 'no-store');
  const target =
    req.method === 'GET' ? boundedTelemetryExport(req.url ?? '') : null;
  if (!target) {
    res.writeHead(404).end();
    return;
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  req.once('aborted', abort);
  res.once('close', abort);
  if (req.aborted || res.destroyed) abort();
  try {
    const body = await readBoundedTelemetryExport(
      new URL(target, origin),
      controller.signal,
      timeoutMs,
    );
    if (res.destroyed || controller.signal.aborted) return;
    res
      .writeHead(200, {
        'content-type': 'application/stream+json',
        'content-length': String(body.length),
        'x-content-type-options': 'nosniff',
      })
      .end(body);
  } catch {
    if (!res.destroyed)
      res
        .writeHead(502, {
          'content-type': 'text/plain; charset=utf-8',
        })
        .end('Telemetry export is unavailable right now.');
  } finally {
    req.removeListener('aborted', abort);
    res.removeListener('close', abort);
  }
}

// Prepared composition, deliberately unmounted by the application. Resolve the
// stored session on every request before any bounded export reaches upstream.
export function prepareAuthenticatedTelemetryExport(
  authenticate: (
    request: IncomingMessage,
  ) => Promise<{ freshAdmin: boolean } | null>,
  origin: URL,
) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    if (!(req.url ?? '').split('?')[0].startsWith(telemetryExportPath)) {
      next();
      return;
    }
    res.setHeader('cache-control', 'no-store');
    try {
      if (
        !boundedTelemetryExport(req.url ?? '') ||
        req.method !== 'GET' ||
        !(await authenticate(req))?.freshAdmin
      ) {
        res.writeHead(404).end();
        return;
      }
    } catch {
      res.writeHead(404).end();
      return;
    }
    await proxyBoundedTelemetryExport(req, res, origin);
  };
}
