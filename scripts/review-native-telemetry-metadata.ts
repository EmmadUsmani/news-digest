// Explicit bounded metadata reads only. Never print response bodies or tenant IDs.
import assert from 'node:assert/strict';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) {
    const variants = [
      ...new Set(value.map((item) => JSON.stringify(shape(item)))),
    ];
    return variants.map((variant) => JSON.parse(variant) as unknown);
  }
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, shape(item)]),
    );
  return value === null ? 'null' : typeof value;
}

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--live']);
  const reviews = [
    [
      8428,
      '/metrics/prometheus/vmui/config.json',
      {
        version: 'string',
        license: { type: 'string' },
        vmalert: { enabled: 'boolean' },
      },
    ],
    [
      8428,
      '/metrics/prometheus/vmui/custom-dashboards',
      { dashboardsSettings: [] },
    ],
    [8428, '/metrics/prometheus/vmui/timezone', { timezone: 'string' }],
    [
      8428,
      '/metrics/vmui/dashboards/perJobUsage.json',
      {
        title: 'string',
        rows: [
          { panels: [{ title: 'string', width: 'number', expr: ['string'] }] },
        ],
      },
    ],
    [
      9428,
      '/logs/select/buildinfo',
      { status: 'string', data: { version: 'string' } },
    ],
    [
      9428,
      '/logs/select/tenant_ids',
      [{ account_id: 'number', project_id: 'number' }],
    ],
  ] as const;
  for (const [port, path, expected] of reviews) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.match(
      response.headers.get('content-type') ?? '',
      /^(application\/json|text\/plain)/,
    );
    assert.ok(response.body);
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        assert.ok(bytes <= 16384, 'Metadata exceeds review limit');
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const actual = shape(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    // Compare shapes without assertion output exposing unexpected field names.
    assert.ok(
      JSON.stringify(actual) === JSON.stringify(expected),
      'Metadata shape changed; private review required',
    );
    console.log(
      JSON.stringify({
        path,
        status: response.status,
        bytes,
        reviewedShape: expected,
      }),
    );
  }
}
main().catch(() => {
  console.error(
    'Native telemetry metadata review failed; response bodies withheld.',
  );
  process.exitCode = 1;
});
