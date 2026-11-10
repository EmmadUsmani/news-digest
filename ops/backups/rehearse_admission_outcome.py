#!/usr/bin/env python3
"""Rehearse migration 0019 on a fresh private restore; never migrate live storage."""
import fcntl
import hashlib
import json
import os
import subprocess
import tempfile
import time
from urllib.parse import quote

import database
from rehearse_accounts import LEDGER, TABLES
from rehearse_system import fingerprints, query

MIGRATION = '0019_admin_write_outcomes.sql'
TAG = MIGRATION.removesuffix('.sql')


def original_rows(container):
    result = fingerprints(container)
    # The additive column changes row JSON, so compare every original field.
    result['admin_write_admissions'] = query(container, """SELECT count(*)::text || ':' ||
      md5(coalesce(string_agg(row_hash, '' ORDER BY row_hash), '')) FROM
      (SELECT md5((to_jsonb(t) - 'outcome')::text) row_hash
       FROM admin_write_admissions t) rows;""")
    return result


def verify(container, socket_directory):
    before = original_rows(container)
    ledger_before = query(container, LEDGER)
    if query(container, "SELECT count(*) FROM schema_migrations WHERE name='drizzle/0018_admin_write_admissions.sql';") != '1':
        raise RuntimeError('Requires completed phase-3 migrations')
    if query(container, f"SELECT count(*) FROM schema_migrations WHERE name >= 'drizzle/{MIGRATION}';") != '0':
        raise RuntimeError('Requires migration 0019 pending')
    contents = (database.ROOT / 'drizzle' / MIGRATION).read_text()
    try:
        query(container, 'BEGIN;\n' + contents +
              f"\nINSERT INTO schema_migrations(name) VALUES ('drizzle/{MIGRATION}');\nSELECT 1/0; COMMIT;")
    except subprocess.CalledProcessError:
        pass
    else:
        raise RuntimeError('Injected failure did not abort')
    if (original_rows(container) != before or query(container, LEDGER) != ledger_before or
            query(container, "SELECT count(*) FROM information_schema.columns WHERE table_name='admin_write_admissions' AND column_name='outcome';") != '0'):
        raise RuntimeError('Failed migration retained changes')
    # pg_restore intentionally omits cluster roles/ACLs. Establish operational
    # reader roles and prove the additive migration does not grant account access.
    query(container, 'CREATE ROLE grafana_product; CREATE ROLE postgres_metrics; CREATE ROLE account_public_probe;')
    environment = {key: value for key, value in os.environ.items()
                   if key in ('PATH', 'HOME', 'USER', 'LANG')}
    environment['MIGRATE_THROUGH'] = TAG
    environment['DATABASE_URL'] = ('postgresql://postgres@localhost/news_digest?host=' +
                                   quote(str(socket_directory), safe=''))
    command = ['pnpm', 'exec', 'tsx', 'apps/api/src/libs/db/migrate.ts']
    database.run(command, cwd=database.ROOT, env=environment, stdout=subprocess.DEVNULL)
    if original_rows(container) != before:
        raise RuntimeError('Migration changed original data')
    if query(container, "SELECT count(*) FROM admin_write_admissions WHERE outcome IS NOT NULL;") != '0':
        raise RuntimeError('Existing admissions acquired an outcome')
    if query(container, f"SELECT count(*) FROM schema_migrations WHERE name='drizzle/{MIGRATION}';") != '1':
        raise RuntimeError('Migration ledger entry missing')
    if query(container, f"SELECT count(*) FROM schema_migrations WHERE name > 'drizzle/{MIGRATION}';") != '0':
        raise RuntimeError('Runner exceeded stopping tag')
    first = fingerprints(container)
    ledger = query(container, LEDGER)
    database.run(command, cwd=database.ROOT, env=environment, stdout=subprocess.DEVNULL)
    if fingerprints(container) != first or query(container, LEDGER) != ledger:
        raise RuntimeError('Repeated runner changed data or ledger')
    # Roll back sample admissions; no copied account row is read or changed.
    for outcome in ('NULL', "'changed'", "'unchanged'"):
        query(container, f"""BEGIN; INSERT INTO admin_write_admissions
          (local_script, method, target, created_at, outcome)
          VALUES (true, 'PUT', '/api/topics', now(), {outcome}); ROLLBACK;""")
    try:
        query(container, """BEGIN; INSERT INTO admin_write_admissions
          (local_script, method, target, created_at, outcome)
          VALUES (true, 'PUT', '/api/topics', now(), 'invalid'); ROLLBACK;""")
    except subprocess.CalledProcessError:
        pass
    else:
        raise RuntimeError('Invalid outcome accepted')
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
        raise RuntimeError('Verification retained data changes')
    manifest_path = sorted(database.DIRECTORY.glob('news-digest-*.json'))[-1]
    manifest = json.loads(manifest_path.read_text())
    receipt = {'checked_at': time.time(), 'backup': manifest_path.stem,
               'backup_sha256': manifest['sha256'],
               'migration_sha256': hashlib.sha256(contents.encode()).hexdigest(),
               'migration_stopping_tag': TAG, 'original_tables_preserved': len(before),
               'injected_failure_rollback': True, 'actual_migration_runner': True,
               'runner_idempotent': True, 'outcome_constraint_checked': True,
               'reader_roles_checked': 3, 'private_tables': len(TABLES),
               'live_database_migrated': False}
    (database.DIRECTORY / 'admission-outcome-migration-proof.json').write_text(json.dumps(receipt) + '\n')
    print(f'0019 rehearsal verified: {len(before)} original tables preserved; rollback; runner twice; outcome constraint; eight private tables deny three reader roles')


def main():
    if 13 <= time.gmtime().tm_hour < 16:
        raise RuntimeError('Edition protection window')
    os.umask(0o077)
    database.DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    database.DIRECTORY.chmod(0o700)
    with (database.DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        database.backup()
        with tempfile.TemporaryDirectory(prefix='news-digest-outcome-') as private:
            socket_directory = database.Path(private) / 'socket'
            socket_directory.mkdir(mode=0o777)
            socket_directory.chmod(0o777)
            database.restore(verify=lambda container: verify(container, socket_directory),
                             socket_directory=socket_directory)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'0019 rehearsal failed ({type(error).__name__}); private data suppressed', flush=True)
        raise SystemExit(1) from None
