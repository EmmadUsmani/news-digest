import { proxyProof } from './lib/proxy-proof';

const port = Number(process.argv[2] ?? 8765);
if (!Number.isInteger(port) || port < 3000 || port > 9999 || port === 8000)
  throw new Error(
    'Choose an unused documented alternate port, 3000–9999, excluding 8000',
  );
const { server, path } = proxyProof((receipt) => {
  console.log(JSON.stringify(receipt));
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
