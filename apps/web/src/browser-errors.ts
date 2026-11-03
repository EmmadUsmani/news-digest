const errorTypes = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
]);

// Deliberately omit arbitrary message/reason/stack text and page URLs: they can
// contain owner content, query strings or credentials. Never inspect rejections.
export function installBrowserErrors() {
  let remaining = 5;
  const send = (kind: 'error' | 'unhandledrejection', event?: ErrorEvent) => {
    if (remaining <= 0) return;
    remaining--;
    let asset: string | undefined;
    try {
      const url = new URL(event?.filename ?? '', location.origin);
      const name = url.pathname.split('/').pop() ?? '';
      if (
        url.origin === location.origin &&
        url.pathname.startsWith('/assets/') &&
        /^[a-zA-Z0-9_-]{1,100}\.js$/.test(name)
      )
        asset = name;
    } catch {
      /* Unknown source remains omitted. */
    }
    const name = event?.error instanceof Error ? event.error.name : '';
    const coordinate = (value: number | undefined) =>
      Number.isInteger(value) && value! >= 0 && value! <= 10_000_000
        ? value
        : undefined;
    void fetch('/api/browser-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      keepalive: true,
      body: JSON.stringify({
        kind,
        errorType: errorTypes.has(name) ? name : 'Unknown',
        asset,
        line: coordinate(event?.lineno),
        column: coordinate(event?.colno),
      }),
    }).catch(() => {}); // Reporting failures never become another report.
  };
  window.addEventListener('error', (event) => send('error', event));
  window.addEventListener('unhandledrejection', () =>
    send('unhandledrejection'),
  );
}
