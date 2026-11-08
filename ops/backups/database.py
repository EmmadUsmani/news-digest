#!/usr/bin/env python3
"""Private snapshot-consistent dumps and isolated restore checks. No provider calls."""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import time
import uuid

ROOT = Path(__file__).resolve().parents[2]
DIRECTORY = Path.home() / 'backups/news-digest'
METRICS = Path('/var/lib/news-digest-node-textfile/database-backup.prom')
IMAGE = 'postgres:17-alpine'


def run(args, **kwargs):
    # Suppress database errors: SQL/data may itself contain private information.
    return subprocess.run(args, check=True, stderr=subprocess.DEVNULL, timeout=300, **kwargs)


def psql(container):
    return ['docker', 'exec', '-i', container, 'psql', '-XqAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'news_digest']


def counts(session):
    session.stdin.write("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;\n\\echo TABLES_END\n")
    session.stdin.flush()
    tables = []
    for line in session.stdout:
        if line.strip() == 'TABLES_END':
            break
        tables.append(line.strip())
    result = {}
    for table in tables:
        quoted = table.replace('"', '""')
        session.stdin.write(f'SELECT count(*) FROM public."{quoted}";\n')
        session.stdin.flush()
        result[table] = int(session.stdout.readline())
    if not result:
        raise RuntimeError('No tables found')
    return result


def connection(container):
    return subprocess.Popen(psql(container), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                            stderr=subprocess.DEVNULL, text=True)


def finish(session):
    session.stdin.write('ROLLBACK;\n\\q\n')
    session.stdin.flush()
    session.wait(timeout=10)
    if session.returncode:
        raise RuntimeError('Snapshot session failed')


def prune(directory, now):
    for manifest in directory.glob('news-digest-*.json'):
        if manifest.stat().st_mtime < now - 7 * 86400:
            manifest.with_suffix('.dump').unlink(missing_ok=True)
            manifest.unlink()


def publish_metric(directory, target):
    completed = [json.loads(p.read_text())['completed_at'] for p in directory.glob('news-digest-*.json')
                 if p.with_suffix('.dump').is_file()]
    value = max(completed, default=0)
    temporary = target.with_suffix('.tmp')
    temporary.write_text(f'# TYPE news_digest_database_backup_success_timestamp_seconds gauge\nnews_digest_database_backup_success_timestamp_seconds {value}\n')
    temporary.chmod(0o644)
    temporary.replace(target)


def backup():
    container = run(['docker', 'compose', 'ps', '-q', 'postgres'], cwd=ROOT,
                    stdout=subprocess.PIPE, text=True).stdout.strip()
    if not container:
        raise RuntimeError('Database container missing')
    name = 'news-digest-' + time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())
    dump = DIRECTORY / (name + '.dump')
    temporary = DIRECTORY / (name + '.partial')
    session = connection(container)
    try:
        session.stdin.write('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;\nSELECT pg_export_snapshot();\n')
        session.stdin.flush()
        snapshot = session.stdout.readline().strip()
        if not snapshot:
            raise RuntimeError('Snapshot unavailable')
        expected = counts(session)
        with temporary.open('xb') as output:
            run(['docker', 'exec', container, 'pg_dump', '-U', 'postgres', '-d', 'news_digest',
                 '-Fc', '--snapshot=' + snapshot], stdout=output)
        finish(session)
        temporary.replace(dump)
        manifest = {'completed_at': time.time(), 'sha256': hashlib.sha256(dump.read_bytes()).hexdigest(),
                    'tables': expected, 'image': IMAGE}
        pending = DIRECTORY / (name + '.json.partial')
        pending.write_text(json.dumps(manifest) + '\n')
        pending.replace(DIRECTORY / (name + '.json'))
        publish_metric(DIRECTORY, METRICS)
        prune(DIRECTORY, time.time())
        print(f'Backup complete: {name}; {len(expected)} tables; {dump.stat().st_size} bytes')
    finally:
        temporary.unlink(missing_ok=True)
        if session.poll() is None:
            session.kill()
            session.wait()


def restore(verify=None):
    manifests = sorted(DIRECTORY.glob('news-digest-*.json'))
    if not manifests:
        raise RuntimeError('No completed backup')
    path = manifests[-1]
    manifest = json.loads(path.read_text())
    dump = path.with_suffix('.dump')
    if hashlib.sha256(dump.read_bytes()).hexdigest() != manifest['sha256']:
        raise RuntimeError('Backup checksum mismatch')
    container = 'news-digest-restore-' + uuid.uuid4().hex[:12]
    try:
        run(['docker', 'run', '-d', '--name', container, '--network', 'none', '--memory', '384m',
             '--cpus', '1', '--tmpfs', '/var/lib/postgresql/data:rw',
             '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_DB=news_digest',
             IMAGE], stdout=subprocess.DEVNULL)
        for _ in range(60):
            if subprocess.run(['docker', 'exec', container, 'pg_isready', '-U', 'postgres'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=5).returncode == 0:
                break
            time.sleep(1)
        else:
            raise RuntimeError('Restore container not ready')
        with dump.open('rb') as source:
            run(['docker', 'exec', '-i', container, 'pg_restore', '-U', 'postgres', '-d', 'news_digest',
                 '--exit-on-error', '--no-owner', '--no-privileges'], stdin=source)
        session = connection(container)
        try:
            actual = counts(session)
            finish(session)
        finally:
            if session.poll() is None:
                session.kill()
                session.wait()
        if actual != manifest['tables']:
            raise RuntimeError('Restored table counts differ')
        if verify is not None:
            verify(container)
        receipt = {'checked_at': time.time(), 'backup': path.stem, 'tables_compared': len(actual),
                   'rows_compared': sum(actual.values())}
        (DIRECTORY / 'restore-proof.json').write_text(json.dumps(receipt) + '\n')
        print(f'Restore verified: {len(actual)} tables; {sum(actual.values())} rows')
    finally:
        run(['docker', 'rm', '-fv', container], stdout=subprocess.DEVNULL)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['backup', 'restore'])
    args = parser.parse_args()
    if 13 <= time.gmtime().tm_hour < 16:
        print('Database maintenance skipped during 13:00–16:00 UTC edition protection')
        return
    os.umask(0o077)
    DIRECTORY.mkdir(parents=True, exist_ok=True, mode=0o700)
    DIRECTORY.chmod(0o700)
    with (DIRECTORY / '.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if args.action == 'backup':
            backup()
        else:
            restore()


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Database backup operation failed ({type(error).__name__}); private data suppressed', flush=True)
        raise SystemExit(1) from None
