#!/usr/bin/env python3
"""Rehearse pending system-ownership SQL on a fresh networkless private restore."""
import fcntl
import hashlib
import json
import os
import subprocess
import time

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


def verify(container):
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
    query(container, 'BEGIN;\n' + migration + '\nCOMMIT;')
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
    manifest_path = sorted(database.DIRECTORY.glob('news-digest-*.json'))[-1]
    manifest = json.loads(manifest_path.read_text())
    receipt = {'checked_at': time.time(), 'backup': manifest_path.stem,
               'backup_sha256': manifest['sha256'], 'migration_sha256': hashes,
               'original_tables_preserved': len(before), 'injected_failure_rollback': True,
               'schedule_parity': True, 'foreign_keys_preserved': True,
               'nullable_ownership_columns': 4,
               'scope': 'SQL rehearsal only; adapter/HTTP and AI acceptance remain separate'}
    (database.DIRECTORY / 'system-ownership-proof.json').write_text(json.dumps(receipt) + '\n')
    print(f'System SQL rehearsal verified: {len(before)} original table fingerprints; rollback; schedule parity; four nullable ownership columns')


def main():
    if 13 <= time.gmtime().tm_hour < 16:
        raise RuntimeError('Edition protection window')
    os.umask(0o077)
    database.DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    database.DIRECTORY.chmod(0o700)
    with (database.DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        database.backup()
        database.restore(verify=verify)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'System rehearsal failed ({type(error).__name__}); private data suppressed', flush=True)
        raise SystemExit(1) from None
