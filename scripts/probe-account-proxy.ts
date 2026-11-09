import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { proxyProof } from './lib/proxy-proof';

const port = Number(process.argv[2] ?? 8765);
if (!Number.isInteger(port) || port < 3000 || port > 9999 || port === 8000)
  throw new Error(
    'Choose an unused documented alternate port, 3000–9999, excluding 8000',
  );
const receiptDirectory = join(homedir(), '.local/state/news-digest');
mkdirSync(receiptDirectory, { recursive: true, mode: 0o700 });
const receiptPath = join(receiptDirectory, 'account-proxy-receipt.json');
const { server, path } = proxyProof((receipt) => {
  writeFileSync(
    receiptPath,
    JSON.stringify(
      { checkedAt: new Date().toISOString(), ...receipt },
      null,
      2,
    ) + '\n',
    { mode: 0o600 },
  );
  if (receipt.status === 'running') return;
  console.log(JSON.stringify(receipt));
  console.log(`Receipt saved: ${receiptPath}`);
  server.close();
  server.closeIdleConnections();
});
const timer = setTimeout(() => {
  server.close();
  server.closeAllConnections();
}, 5 * 60_000);
server.on('close', () => clearTimeout(timer));
server.listen(port, '0.0.0.0', () => {
  console.log(
    `Open https://news-digest.exe.xyz:${port}${path} in an authenticated browser; expires in five minutes.`,
  );
});
