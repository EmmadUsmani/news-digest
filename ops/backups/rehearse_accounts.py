#!/usr/bin/env python3
"""Rehearse pending account migrations on a fresh, networkless private restore."""
import fcntl
import hashlib
import json
import os
import subprocess
import tempfile
import time
from urllib.parse import quote

import database
from rehearse_system import fingerprints, query

MIGRATIONS = (
    '0013_reader_sessions.sql', '0014_login_challenges.sql',
    '0015_sign_in_links.sql', '0016_reader_sync.sql',
    '0017_reader_session_revocation.sql', '0018_admin_write_admissions.sql',
)
TABLES = ('users', 'sessions', 'login_codes', 'sign_in_links',
          'admin_audit_log', 'bookmarks', 'user_hidden_topics',
          'admin_write_admissions')
LEDGER = "SELECT md5(string_agg(to_jsonb(m)::text, '' ORDER BY name)) FROM schema_migrations m;"


def verify(container, socket_directory):
    before = fingerprints(container)
    original_ledger = query(container, LEDGER)
    if set(TABLES).intersection(before):
        raise RuntimeError('Rehearsal requires account migrations pending')
    if query(container, "SELECT count(*) FROM schema_migrations WHERE name='drizzle/0012_nullable_system_ownership.sql';") != '1':
        raise RuntimeError('Rehearsal requires completed phase-1 migrations')
    # Dumps omit cluster roles and ACLs. Recreate hostile default grants so the
    # real migration runner must revoke them, rather than merely lacking grants.
    query(container, """CREATE ROLE grafana_product;
      CREATE ROLE postgres_metrics;
      CREATE ROLE account_public_probe;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES
        TO grafana_product, postgres_metrics, PUBLIC;""")
    statements = []
    hashes = {}
    for name in MIGRATIONS:
        contents = (database.ROOT / 'drizzle' / name).read_text()
        hashes[name] = hashlib.sha256(contents.encode()).hexdigest()
        if query(container, f"SELECT count(*) FROM schema_migrations WHERE name='drizzle/{name}';") != '0':
            raise RuntimeError('Account migration already applied')
        statements.append(contents + f"\nINSERT INTO schema_migrations(name) VALUES ('drizzle/{name}');\n")
    try:
        query(container, 'BEGIN;\n' + '\n'.join(statements) + '\nSELECT 1 / 0;\nCOMMIT;')
    except subprocess.CalledProcessError:
        pass
    else:
        raise RuntimeError('Injected migration failure did not abort')
    if fingerprints(container) != before or query(container, LEDGER) != original_ledger:
        raise RuntimeError('Failed migration retained tables, data or ledger entries')
    environment = {key: value for key, value in os.environ.items()
                   if key in ('PATH', 'HOME', 'USER', 'LANG')}
    environment['MIGRATE_THROUGH'] = MIGRATIONS[-1].removesuffix('.sql')
    environment['DATABASE_URL'] = ('postgresql://postgres@localhost/news_digest?host=' +
                                   quote(str(socket_directory), safe=''))
    command = ['pnpm', 'exec', 'tsx', 'apps/api/src/libs/db/migrate.ts']
    database.run(command, cwd=database.ROOT, env=environment, stdout=subprocess.DEVNULL)
    first = fingerprints(container)
    ledger = query(container, LEDGER)
    expected = {f'drizzle/{name}' for name in MIGRATIONS}
    if not expected.issubset(set(query(container, 'SELECT name FROM schema_migrations;').splitlines())):
        raise RuntimeError('Runner did not record all account migrations')
    if set(first) != set(before).union(TABLES):
        raise RuntimeError('Runner created unexpected tables')
    if any(first[table] != value for table, value in before.items()):
        raise RuntimeError('Account migration changed original data')
    if query(container, f"SELECT count(*) FROM schema_migrations WHERE name > 'drizzle/{MIGRATIONS[-1]}';") != '0':
        raise RuntimeError('Runner exceeded account migration boundary')
    database.run(command, cwd=database.ROOT, env=environment, stdout=subprocess.DEVNULL)
    if fingerprints(container) != first or query(container, LEDGER) != ledger:
        raise RuntimeError('Repeated runner changed tables, rows or ledger')
    for role in ('grafana_product', 'postgres_metrics', 'account_public_probe'):
        for table in TABLES:
            for privilege in ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'):
                if query(container, f"SELECT has_table_privilege('{role}', 'public.{table}', '{privilege}');") != 'f':
                    raise RuntimeError('Private account table accessible to reader')
            try:
                query(container, f'SET ROLE {role}; SELECT * FROM public.{table} LIMIT 0;')
            except subprocess.CalledProcessError:
                pass
            else:
                raise RuntimeError('Reader SELECT unexpectedly succeeded')
    if fingerprints(container) != first or query(container, LEDGER) != ledger:
        raise RuntimeError('Privacy checks changed tables, rows or ledger')
    manifest_path = sorted(database.DIRECTORY.glob('news-digest-*.json'))[-1]
    manifest = json.loads(manifest_path.read_text())
    receipt = {'checked_at': time.time(), 'backup': manifest_path.stem,
               'backup_sha256': manifest['sha256'], 'migration_sha256': hashes,
               'original_tables_preserved': len(before), 'injected_failure_rollback': True,
               'actual_migration_runner': True, 'runner_idempotent': True,
               'private_tables': len(TABLES), 'hostile_default_grants_revoked': True,
               'reader_roles_checked': 3, 'live_database_migrated': False}
    (database.DIRECTORY / 'account-migration-proof.json').write_text(json.dumps(receipt) + '\n')
    print(f'Account rehearsal verified: {len(before)} original table fingerprints; rollback; runner twice; {len(TABLES)} private tables; three reader roles denied')


def main():
    if 13 <= time.gmtime().tm_hour < 16:
        raise RuntimeError('Edition protection window')
    os.umask(0o077)
    database.DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    database.DIRECTORY.chmod(0o700)
    with (database.DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        database.backup()
        with tempfile.TemporaryDirectory(prefix='news-digest-accounts-') as private:
            socket_directory = database.Path(private) / 'socket'
            socket_directory.mkdir(mode=0o777)
            socket_directory.chmod(0o777)
            database.restore(verify=lambda container: verify(container, socket_directory),
                             socket_directory=socket_directory)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Account rehearsal failed ({type(error).__name__}); private data suppressed', flush=True)
        raise SystemExit(1) from None
