#!/usr/bin/env python3
"""Rehearse phase-0 publication metadata on a private, networkless restore."""
import datetime
import fcntl
import hashlib
import json
import os
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
        query(container, """
BEGIN;
ALTER TABLE digest_previews ADD COLUMN kind text NOT NULL DEFAULT 'manual'
  CHECK (kind IN ('scheduled', 'manual', 'test'));
ALTER TABLE digest_previews ADD COLUMN published_at timestamptz;
ALTER TABLE digest_previews DISABLE TRIGGER immutable_digest_preview;
UPDATE digest_previews SET
  kind = CASE WHEN scheduled_key LIKE 'integration:%' THEN 'test'
    WHEN scheduled_key IS NOT NULL AND created_at >= '2026-11-03T00:00:00Z'::timestamptz
      THEN 'scheduled' ELSE 'manual' END,
  published_at = CASE WHEN scheduled_key IS NOT NULL
    AND scheduled_key NOT LIKE 'integration:%'
    AND created_at >= '2026-11-03T00:00:00Z'::timestamptz THEN created_at ELSE NULL END;
ALTER TABLE digest_previews ENABLE TRIGGER immutable_digest_preview;
COMMIT;
""")
        after = query(container, "SELECT md5(string_agg((to_jsonb(d) - 'kind' - 'published_at')::text, '' ORDER BY id)) FROM digest_previews d;")
        if original != after:
            raise RuntimeError('Existing edition fields changed')
        # Verify the backfill did not leave saved editions mutable.
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
