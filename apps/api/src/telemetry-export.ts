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
  return `${telemetryExportPath}?${params}`;
}

// Buffer before forwarding: a partial oversized export must never become a
// successful downstream response. Abort fetch on overflow, deadline or caller
// disconnect, including while headers or a body chunk are stalled.
export async function readBoundedTelemetryExport(
  url: URL,
  signal: AbortSignal,
  timeoutMs = 5000,
): Promise<Buffer> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  if (signal.aborted) abort();
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error',
      headers: { 'Accept-Encoding': 'identity' },
    });
    if (
      !response.ok ||
      !response.body ||
      !/application\/.*json/i.test(
        response.headers.get('content-type') ?? '',
      ) ||
      response.headers.has('set-cookie')
    )
      throw new Error('Invalid telemetry export response');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maximumBytes)
        throw new Error('Telemetry export exceeds byte limit');
      chunks.push(value);
    }
    return Buffer.concat(chunks, bytes);
  } finally {
    controller.abort();
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
  }
}
