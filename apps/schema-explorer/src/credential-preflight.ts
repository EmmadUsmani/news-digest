import { randomBytes } from 'node:crypto';

import { Pool } from 'pg';

// No mutations: run before writing service credentials or restarting the explorer.
export async function verifyCatalogCredentials(connectionString: string) {
  const url = new URL(connectionString);
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:')
    throw new Error('Expected a PostgreSQL URL');
  if (
    !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
    decodeURIComponent(url.username) !== 'schema_catalog_reader' ||
    !url.password ||
    url.search
  )
    throw new Error(
      'Expected a loopback catalog-reader URL with a password and no query options',
    );
  const reader = new Pool({ connectionString, connectionTimeoutMillis: 3000 });
  const wrongUrl = new URL(url);
  wrongUrl.password = randomBytes(32).toString('hex');
  const wrong = new Pool({
    connectionString: wrongUrl.toString(),
    connectionTimeoutMillis: 3000,
  });
  try {
    await reader.query('SELECT 1');
    let passwordRejected = false;
    try {
      await wrong.query('SELECT 1');
    } catch (error) {
      passwordRejected = (error as { code?: string }).code === '28P01';
    }
    if (!passwordRejected)
      throw new Error(
        'Wrong-password connection was not rejected by password authentication',
      );
    const identity = await reader.query(`SELECT current_user, session_user,
      current_setting('default_transaction_read_only') AS read_only,
      current_setting('statement_timeout') AS timeout`);
    const row = identity.rows[0];
    if (
      row.current_user !== 'schema_catalog_reader' ||
      row.session_user !== row.current_user ||
      row.read_only !== 'on' ||
      row.timeout !== '10s'
    )
      throw new Error('Unexpected catalog session identity or defaults');
    const unsafe =
      await reader.query(`SELECT 1 FROM pg_roles WHERE rolname=current_user
      AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls OR rolinherit)
      UNION ALL SELECT 1 FROM pg_roles WHERE oid<>current_user::regrole AND pg_has_role(current_user,oid,'MEMBER')
      UNION ALL SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f')
      AND has_table_privilege(current_user,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
      UNION ALL SELECT 1 FROM pg_namespace WHERE nspname NOT LIKE 'pg_temp_%'
      AND nspname NOT LIKE 'pg_toast%' AND has_schema_privilege(current_user,oid,'CREATE')
      UNION ALL SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE p.prosecdef AND n.nspname NOT IN ('pg_catalog','information_schema')
      AND has_function_privilege(current_user,p.oid,'EXECUTE')`);
    if (unsafe.rowCount) throw new Error('Unsafe catalog-reader privileges');
  } finally {
    await Promise.all([reader.end(), wrong.end()]);
  }
}
