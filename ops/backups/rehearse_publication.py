#!/usr/bin/env python3
"""Rehearse phase-0 publication metadata on a private, networkless restore."""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import uuid

import database


def query(container, sql):
    result = subprocess.run(database.psql(container) + ['-v', 'VERBOSITY=sqlstate'], input=sql, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=300)
    if result.returncode:
        # Only expose SQLSTATE, never server details that could contain saved data.
        raise RuntimeError('Scratch query failed: ' + result.stderr.strip()[:40])
    return result.stdout.strip()


def verify_immutable(container):
    query(container, """DO $$ BEGIN
          BEGIN
            UPDATE digest_previews SET snapshot = snapshot;
            RAISE EXCEPTION 'Immutability guard missing' USING ERRCODE = 'XX000';
          EXCEPTION WHEN raise_exception THEN
            IF SQLERRM <> 'Digest previews are immutable' THEN RAISE; END IF;
          END;
          BEGIN
            DELETE FROM digest_previews;
            RAISE EXCEPTION 'Immutability guard missing' USING ERRCODE = 'XX000';
          EXCEPTION WHEN raise_exception THEN
            IF SQLERRM <> 'Digest previews are immutable' THEN RAISE; END IF;
          END;
        END $$;""")


def verify_publication_constraints(container):
    # All insertion probes roll back, including successful manual publication.
    fingerprint_sql = "SELECT md5(string_agg(to_jsonb(d)::text, '' ORDER BY id)) FROM digest_previews d;"
    original = query(container, fingerprint_sql)
    query(container, """BEGIN;
      DO $$ DECLARE candidate digest_previews%ROWTYPE; rejected text; BEGIN
        SELECT * INTO STRICT candidate FROM digest_previews LIMIT 1;
        candidate.id := gen_random_uuid();
        candidate.scheduled_key := NULL;
        candidate.kind := 'test';
        candidate.published_at := now();
        BEGIN
          INSERT INTO digest_previews SELECT candidate.*;
          RAISE EXCEPTION 'Published test edition accepted';
        EXCEPTION WHEN check_violation THEN
          GET STACKED DIAGNOSTICS rejected = CONSTRAINT_NAME;
          IF rejected <> 'digest_previews_test_unpublished' THEN
            RAISE EXCEPTION 'Wrong constraint rejected test publication';
          END IF;
        END;
        candidate.published_at := NULL;
        INSERT INTO digest_previews SELECT candidate.*;
        candidate.id := gen_random_uuid();
        candidate.kind := 'manual';
        INSERT INTO digest_previews SELECT candidate.*;
        candidate.id := gen_random_uuid();
        candidate.published_at := now();
        INSERT INTO digest_previews SELECT candidate.*;
        candidate.id := gen_random_uuid();
        candidate.kind := 'scheduled';
        INSERT INTO digest_previews SELECT candidate.*;
      END $$;
      ROLLBACK;""")
    if query(container, fingerprint_sql) != original:
        raise RuntimeError('Publication probes changed saved editions')
    verify_immutable(container)
    return 5


def verify_rollback(container, migration, original):
    # Exercise failure with the guard disabled, both before and after the data update.
    for checkpoint in ('UPDATE digest_previews SET',
                       'ALTER TABLE digest_previews ENABLE TRIGGER'):
        if migration.count(checkpoint) != 1:
            raise RuntimeError('Backfill failure checkpoint missing or ambiguous')
        failing = migration.replace(checkpoint, 'SELECT 1 / 0;\n' + checkpoint, 1)
        try:
            query(container, failing)
        except RuntimeError as error:
            if '22012' not in str(error):
                raise
        else:
            raise RuntimeError('Injected backfill failure did not abort')
        columns = query(container, """SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'digest_previews'
          AND column_name IN ('kind', 'published_at');""")
        if columns != '0':
            raise RuntimeError('Failed backfill retained publication columns')
        current = query(container, "SELECT md5(string_agg(to_jsonb(d)::text, '' ORDER BY id)) FROM digest_previews d;")
        if current != original:
            raise RuntimeError('Failed backfill changed existing editions')
        verify_immutable(container)
    return 2


def verify_reader_visibility(container):
    fingerprint = "SELECT md5(string_agg(to_jsonb(d)::text, '' ORDER BY id)) FROM digest_previews d;"
    original = query(container, fingerprint)
    checks = Path(__file__).with_name('publication_reader_checks.sql').read_text()
    query(container, checks)
    # Prove the contract rejects both a leaked private edition and broken paging.
    mutations = [
        checks.replace('WHERE published_at IS NOT NULL', 'WHERE true'),
        checks.replace('LIMIT 2 OFFSET position', 'LIMIT 2 OFFSET 0'),
    ]
    for mutation in mutations:
        if mutation == checks:
            raise RuntimeError('Reader mutation checkpoint missing')
        try:
            query(container, mutation)
        except RuntimeError as error:
            if 'P0001' not in str(error):
                raise
        else:
            raise RuntimeError('Broken reader query passed rehearsal')
    if query(container, fingerprint) != original:
        raise RuntimeError('Reader probes changed saved editions')
    verify_immutable(container)
    return len(mutations)


def verify_future_writes(container):
    root = Path(__file__).resolve().parents[2]
    generated = subprocess.run(['pnpm', 'exec', 'tsx', 'scripts/publication-write-probes.ts'],
                               cwd=root, text=True, stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE, timeout=30)
    if generated.returncode:
        raise RuntimeError('Future publication policy probe generation failed')
    probes = json.loads(generated.stdout)
    if len(probes) != 8:
        raise RuntimeError('Future publication probes missing')
    # Hex encoding keeps probe values out of SQL syntax and server diagnostics.
    expression = "convert_from(decode('" + json.dumps(probes).encode().hex() + "', 'hex'), 'UTF8')::jsonb"
    checks = Path(__file__).with_name('publication_write_checks.sql').read_text()
    if checks.count('PROBE_JSON') != 1:
        raise RuntimeError('Future publication placeholder missing or ambiguous')
    checks = checks.replace('PROBE_JSON', expression)
    fingerprint = "SELECT md5(string_agg(to_jsonb(d)::text, '' ORDER BY id)) FROM digest_previews d;"
    original = query(container, fingerprint)
    query(container, checks)
    # Verify the oracle catches default/manual wiring and lost publication time.
    mutations = [
        checks.replace("candidate.kind := probe->>'kind';", "candidate.kind := 'manual';"),
        checks.replace("candidate.published_at := (probe->>'publishedAt')::timestamptz;",
                       "candidate.published_at := NULL;"),
    ]
    for mutation in mutations:
        if mutation == checks:
            raise RuntimeError('Future write mutation checkpoint missing')
        try:
            query(container, mutation)
        except RuntimeError as error:
            if 'P0001' not in str(error):
                raise
        else:
            raise RuntimeError('Broken future publication write passed rehearsal')
    if query(container, fingerprint) != original:
        raise RuntimeError('Future publication probes changed saved editions')
    verify_immutable(container)
    return len(probes)


def rehearse():
    database.backup()
    manifest_path = sorted(database.DIRECTORY.glob('news-digest-*.json'))[-1]
    manifest = json.loads(manifest_path.read_text())
    dump = manifest_path.with_suffix('.dump')
    if hashlib.sha256(dump.read_bytes()).hexdigest() != manifest['sha256']:
        raise RuntimeError('Backup checksum mismatch')
    container = 'news-digest-publication-' + uuid.uuid4().hex[:12]
    try:
        database.run(['docker', 'run', '-d', '--name', container, '--network', 'none',
                      '--memory', '384m', '--cpus', '1', '--tmpfs', '/var/lib/postgresql/data:rw',
                      '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_DB=news_digest',
                      database.IMAGE], stdout=subprocess.DEVNULL)
        for _ in range(60):
            if subprocess.run(['docker', 'exec', container, 'pg_isready', '-U', 'postgres'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5).returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('Scratch database not ready')
        with dump.open('rb') as source:
            database.run(['docker', 'exec', '-i', container, 'pg_restore', '-U', 'postgres',
                          '-d', 'news_digest', '--exit-on-error', '--no-owner', '--no-privileges'], stdin=source)
        session = database.connection(container)
        try:
            restored = database.counts(session)
            database.finish(session)
        finally:
            if session.poll() is None:
                session.kill()
                session.wait()
        if restored != manifest['tables']:
            raise RuntimeError('Restored table counts differ')
        # Hash every pre-existing edition field, not just selected display counts.
        original = query(container, "SELECT md5(string_agg(to_jsonb(d)::text, '' ORDER BY id)) FROM digest_previews d;")
        migration = Path(__file__).with_name('publication_metadata.sql').read_text()
        rollback_checks = verify_rollback(container, migration, original)
        query(container, migration)
        after = query(container, "SELECT md5(string_agg((to_jsonb(d) - 'kind' - 'published_at')::text, '' ORDER BY id)) FROM digest_previews d;")
        if original != after:
            raise RuntimeError('Existing edition fields changed')
        verify_immutable(container)
        constraint_checks = verify_publication_constraints(container)
        reader_mutations = verify_reader_visibility(container)
        future_write_checks = verify_future_writes(container)
        rows = json.loads(query(container, """SELECT json_agg(json_build_object(
          'key', scheduled_key, 'created', created_at, 'kind', kind, 'published', published_at))
          FROM digest_previews;"""))
        kinds = {'scheduled': 0, 'manual': 0, 'test': 0}
        cutoff = datetime.datetime(2026, 11, 3, tzinfo=datetime.timezone.utc)
        for row in rows:
            created = datetime.datetime.fromisoformat(row['created'])
            key = row['key']
            expected = ('test' if key is not None and key.startswith('integration:') else
                        'scheduled' if key is not None and created >= cutoff else 'manual')
            published = datetime.datetime.fromisoformat(row['published']) if row['published'] else None
            if row['kind'] != expected or published != (created if expected == 'scheduled' else None):
                raise RuntimeError('Publication classification differs from owner policy')
            kinds[expected] += 1
        receipt = {'checked_at': time.time(), 'backup': manifest_path.stem,
                   'tables_compared': len(restored), 'rows_compared': sum(restored.values()),
                   'editions_unchanged': len(rows), 'kinds': kinds,
                   'rollback_checkpoints_passed': rollback_checks,
                   'publication_constraint_checks_passed': constraint_checks,
                   'reader_visibility_checks_passed': True,
                   'reader_mutations_rejected': reader_mutations,
                   'future_write_checks_passed': future_write_checks,
                   'future_write_mutations_rejected': 2,
                   'published': kinds['scheduled'], 'production_schema_changed': False}
        (database.DIRECTORY / 'publication-rehearsal-proof.json').write_text(json.dumps(receipt) + '\n')
        print(json.dumps(receipt))
    finally:
        database.run(['docker', 'rm', '-fv', container], stdout=subprocess.DEVNULL)


if __name__ == '__main__':
    if 13 <= time.gmtime().tm_hour < 16:
        raise SystemExit('Rehearsal refused during edition protection window')
    os.umask(0o077)
    database.DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    database.DIRECTORY.chmod(0o700)
    with (database.DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        rehearse()
