import { verifyCatalogCredentials } from './credential-preflight.ts';

try {
  const url = process.env.SCHEMA_EXPLORER_DATABASE_URL;
  if (!url) throw new Error('Missing configuration');
  await verifyCatalogCredentials(url);
  console.log(
    'Catalog credential preflight passed; no service configuration changed.',
  );
} catch {
  // Driver errors can contain connection details. Never print them.
  console.error(
    'Catalog credential preflight failed; check password authentication, role privileges and session defaults.',
  );
  process.exitCode = 1;
}
