import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// An isolated Fluent Bit child with dummy input and stdout only: no journal,
// live credentials, container/filesystem tails, HTTP output or production state.
export async function checkLogRedaction() {
  const directory = mkdtempSync(join(tmpdir(), 'obs-redaction-'));
  const secret = 'synthetic-obs-credential';
  const fixture = {
    _SYSTEMD_USER_UNIT: 'news-digest-api.service',
    _CMDLINE: 'must-be-omitted',
    msg: `fixture ${secret} Bearer invented-token https://user:pass@example.test`,
    nested: { apiKey: 'invented-key', text: secret, safe: 'retained' },
  };
  writeFileSync(join(directory, 'env'), 'ANTHROPIC_API_KEY=unused\n');
  writeFileSync(
    join(directory, 'fluent.conf'),
    `[SERVICE]
    Flush 0.1
    Grace 0
[INPUT]
    Name dummy
    Tag journal
    Samples 1
    Dummy ${JSON.stringify(fixture)}
[FILTER]
    Name lua
    Match *
    Script ${resolve('ops/observability/normalize.lua')}
    Call normalize
[OUTPUT]
    Name stdout
    Match *
    Format json_lines
`,
  );
  try {
    const output = await new Promise<string>((resolve, reject) => {
      let result = '';
      let diagnostic = '';
      const child = spawn(
        '/opt/news-digest-observability/fluent/opt/fluent-bit/bin/fluent-bit',
        ['-c', join(directory, 'fluent.conf')],
        {
          env: {
            PATH: process.env.PATH,
            ANTHROPIC_API_KEY: secret,
            NEWS_DIGEST_OBS_ENV_FILE: join(directory, 'env'),
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        reject(
          new Error(`Redaction probe timed out: ${diagnostic.slice(-500)}`),
        );
      }, 10_000);
      child.stdout.on('data', (chunk: Buffer) => {
        result += chunk.toString();
        if (result.includes('\n')) child.kill('SIGTERM');
      });
      child.stderr.on('data', (chunk: Buffer) => {
        diagnostic += chunk.toString();
      });
      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on('exit', () => {
        clearTimeout(timer);
        if (result.trim()) resolve(result);
        else
          reject(
            new Error(`No redaction probe result: ${diagnostic.slice(-500)}`),
          );
      });
    });
    for (const unsafe of [
      secret,
      'invented-token',
      'invented-key',
      'user:pass',
      'must-be-omitted',
    ])
      assert.ok(
        !output.includes(unsafe),
        'Shipper must remove synthetic credentials/metadata',
      );
    const record = JSON.parse(output.trim().split('\n')[0]) as {
      service: string;
      nested: { safe: string };
    };
    assert.equal(record.service, 'api');
    assert.equal(record.nested.safe, 'retained');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
