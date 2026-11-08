#!/usr/bin/env python3
"""Rehearse pending system-ownership SQL on a fresh networkless private restore."""
import fcntl
import hashlib
import json
import os
import subprocess
import tempfile
import time
from urllib.parse import quote

import database

MIGRATIONS = ('0011_system_edition_settings.sql', '0012_nullable_system_ownership.sql')


def query(container, sql):
    result = database.run(database.psql(container), input=sql, text=True,
                          stdout=subprocess.PIPE)
    return result.stdout.strip()


def fingerprints(container):
    # Hash every complete row, ordered independently of storage layout. No row data
    # leaves the scratch database; only table names, counts and hashes are returned.
    tables = query(container, "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'schema_migrations' ORDER BY tablename;").splitlines()
    result = {}
    for table in tables:
        quoted = table.replace('"', '""')
        result[table] = query(container, f'''SELECT count(*)::text || ':' ||
          md5(coalesce(string_agg(row_hash, '' ORDER BY row_hash), ''))
          FROM (SELECT md5(to_jsonb(t)::text) row_hash FROM public."{quoted}" t) rows;''')
    return result


def verify(container, socket_directory):
    before = fingerprints(container)
    foreign_keys_sql = """SELECT md5(coalesce(string_agg(conrelid::regclass::text || ':' ||
      conname || ':' || pg_get_constraintdef(oid), '' ORDER BY conrelid::regclass::text, conname), ''))
      FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace;"""
    foreign_keys = query(container, foreign_keys_sql)
    if 'edition_settings' in before:
        raise RuntimeError('Rehearsal requires the pre-phase-1 schema')
    statements = []
    hashes = {}
    for name in MIGRATIONS:
        contents = (database.ROOT / 'drizzle' / name).read_text()
        hashes[name] = hashlib.sha256(contents.encode()).hexdigest()
        applied = query(container, f"SELECT count(*) FROM schema_migrations WHERE name='drizzle/{name}';")
        if applied != '0':
            raise RuntimeError('Rehearsal migration already applied')
        statements.append(contents + f"\nINSERT INTO schema_migrations(name) VALUES ('drizzle/{name}');\n")
    migration = '\n'.join(statements)
    # An error after both DDL files must roll back settings, nullability and ledger.
    try:
        query(container, 'BEGIN;\n' + migration + '\nSELECT 1 / 0;\nCOMMIT;')
    except subprocess.CalledProcessError:
        pass
    else:
        raise RuntimeError('Injected migration failure did not abort')
    if fingerprints(container) != before:
        raise RuntimeError('Failed migration changed original data')
    if query(container, "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('topics','digest_previews','edition_job_requests','edition_job_failures') AND column_name='profile_id' AND is_nullable='NO';") != '4':
        raise RuntimeError('Failed migration retained nullable ownership')
    if query(container, "SELECT count(*) FROM schema_migrations WHERE name IN ('drizzle/0011_system_edition_settings.sql','drizzle/0012_nullable_system_ownership.sql');") != '0':
        raise RuntimeError('Failed migration retained ledger entries')
    # Execute the same entry point used in production, through a private Unix
    # socket. No TCP port, live credentials or provider configuration is supplied.
    environment = {key: value for key, value in os.environ.items()
                   if key in ('PATH', 'HOME', 'USER', 'LANG')}
    environment['DATABASE_URL'] = ('postgresql://postgres@localhost/news_digest?host=' +
                                   quote(str(socket_directory), safe=''))
    command = ['pnpm', 'exec', 'tsx', 'apps/api/src/libs/db/migrate.ts']
    database.run(command, cwd=database.ROOT, env=environment,
                 stdout=subprocess.DEVNULL)
    first_run = fingerprints(container)
    ledger_sql = "SELECT md5(string_agg(to_jsonb(m)::text, '' ORDER BY name)) FROM schema_migrations m;"
    ledger = query(container, ledger_sql)
    expected = {f'drizzle/{name}' for name in MIGRATIONS}
    if not expected.issubset(set(query(container, 'SELECT name FROM schema_migrations;').splitlines())):
        raise RuntimeError('Migration runner did not record pending migrations')
    database.run(command, cwd=database.ROOT, env=environment,
                 stdout=subprocess.DEVNULL)
    if fingerprints(container) != first_run or query(container, ledger_sql) != ledger:
        raise RuntimeError('Repeated migration runner changed data or ledger')
    after = fingerprints(container)
    after.pop('edition_settings', None)
    if after != before:
        raise RuntimeError('Successful migration changed original data')
    if query(container, foreign_keys_sql) != foreign_keys:
        raise RuntimeError('Migration changed existing foreign keys')
    query(container, """DO $$ BEGIN
      IF (SELECT count(*) FROM edition_settings) <> 1 OR NOT EXISTS (
        SELECT 1 FROM edition_settings e JOIN digest_schedules s
        ON s.profile_id = '00000000-0000-4000-8000-000000000001'
        WHERE (e.cadence,e.timezone,e.coverage_window,e.story_budget,e.post_budget) =
              (s.cadence,s.timezone,s.coverage_window,s.story_budget,s.post_budget)
      ) THEN RAISE EXCEPTION 'System schedule differs'; END IF;
      IF (SELECT count(*) FROM information_schema.columns WHERE table_schema='public'
        AND table_name IN ('topics','digest_previews','edition_job_requests','edition_job_failures')
        AND column_name='profile_id' AND is_nullable='YES') <> 4
      THEN RAISE EXCEPTION 'Ownership nullability differs'; END IF;
    END $$;""")
    environment['SYSTEM_READ_REHEARSAL'] = '1'
    environment['DATABASE_URL'] += '&options=' + quote('-c default_transaction_read_only=on', safe='')
    database.run(['pnpm', 'exec', 'tsx', 'apps/api/scripts/rehearse-system-reads.ts'],
                 cwd=database.ROOT, env=environment)
    if fingerprints(container) != first_run or query(container, ledger_sql) != ledger:
        raise RuntimeError('Read comparisons changed restored data or ledger')
    manifest_path = sorted(database.DIRECTORY.glob('news-digest-*.json'))[-1]
    manifest = json.loads(manifest_path.read_text())
    receipt = {'checked_at': time.time(), 'backup': manifest_path.stem,
               'backup_sha256': manifest['sha256'], 'migration_sha256': hashes,
               'original_tables_preserved': len(before), 'injected_failure_rollback': True,
               'schedule_parity': True, 'foreign_keys_preserved': True,
               'nullable_ownership_columns': 4,
               'actual_migration_runner': True, 'runner_idempotent': True,
               'adapter_read_parity': True, 'read_only_fingerprints_preserved': True,
               'scope': 'SQL rollback, actual runner and adapter read parity; HTTP and AI acceptance remain separate'}
    (database.DIRECTORY / 'system-ownership-proof.json').write_text(json.dumps(receipt) + '\n')
    print(f'System SQL rehearsal verified: {len(before)} original table fingerprints; rollback; actual runner twice; schedule parity; four nullable ownership columns')


def main():
    if 13 <= time.gmtime().tm_hour < 16:
        raise RuntimeError('Edition protection window')
    os.umask(0o077)
    database.DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    database.DIRECTORY.chmod(0o700)
    with (database.DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        database.backup()
        with tempfile.TemporaryDirectory(prefix='news-digest-rehearsal-') as private:
            socket_directory = database.Path(private) / 'socket'
            socket_directory.mkdir(mode=0o777)
            socket_directory.chmod(0o777)
            database.restore(verify=lambda container: verify(container, socket_directory),
                             socket_directory=socket_directory)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'System rehearsal failed ({type(error).__name__}); private data suppressed', flush=True)
        raise SystemExit(1) from None
