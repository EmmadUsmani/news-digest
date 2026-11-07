#!/usr/bin/env python3
"""Encrypted B2 backups. S3 SigV4 over curl; credentials never enter logs."""
import datetime as dt
import fcntl
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import tarfile
import tempfile
import time
import urllib.parse
import xml.etree.ElementTree as ET

HOME = Path.home()
DIRECTORY = HOME / 'backups/news-digest'
STATE = DIRECTORY / 'offsite.json'
METRICS = Path('/var/lib/news-digest-node-textfile/offsite-backup.prom')
B2_BUDGET_BYTES = 3_000_000_000
NS = {'s': 'http://s3.amazonaws.com/doc/2006-03-01/'}
PATTERN = re.compile(r'^(database|vm)/\d{8}T\d{6}Z-[a-f0-9]{12}\.age$')


def settings():
    result = {}
    for line in (HOME / '.config/news-digest/env').read_text().splitlines():
        parts = shlex.split(line, comments=True)
        if parts and parts[0] == 'export':
            parts = parts[1:]
        if len(parts) == 1 and '=' in parts[0]:
            key, value = parts[0].split('=', 1)
            result[key] = value
    for key in ['B2_KEY_ID', 'B2_APPLICATION_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'BACKUP_AGE_RECIPIENT']:
        if not result.get(key):
            raise RuntimeError('Backup setting missing')
    return result


class S3:
    def __init__(self, config):
        self.config = config
        endpoint = config['B2_ENDPOINT']
        self.host = urllib.parse.urlsplit(endpoint if '://' in endpoint else 'https://' + endpoint).netloc
        match = re.fullmatch(r's3\.([a-z0-9-]+)\.backblazeb2\.com', self.host)
        if not match:
            raise RuntimeError('Expected B2 S3 endpoint')
        self.region = match[1]

    def request(self, method, key='', query=None, body=b''):
        stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        date = stamp[:8]
        path = '/' + urllib.parse.quote(self.config['B2_BUCKET'], safe='')
        if key:
            path += '/' + urllib.parse.quote(key, safe='/')
        query_string = urllib.parse.urlencode(sorted((query or {}).items()), quote_via=urllib.parse.quote, safe='~')
        digest = hashlib.sha256(body).hexdigest()
        headers = {'host': self.host, 'x-amz-content-sha256': digest, 'x-amz-date': stamp}
        names = ';'.join(sorted(headers))
        canonical = '\n'.join([method, path, query_string,
                               ''.join(k + ':' + headers[k] + '\n' for k in sorted(headers)), names, digest])
        scope = f'{date}/{self.region}/s3/aws4_request'
        signed = '\n'.join(['AWS4-HMAC-SHA256', stamp, scope, hashlib.sha256(canonical.encode()).hexdigest()])
        secret = ('AWS4' + self.config['B2_APPLICATION_KEY']).encode()
        for value in [date, self.region, 's3', 'aws4_request']:
            secret = hmac.new(secret, value.encode(), hashlib.sha256).digest()
        signature = hmac.new(secret, signed.encode(), hashlib.sha256).hexdigest()
        headers['Authorization'] = f'AWS4-HMAC-SHA256 Credential={self.config["B2_KEY_ID"]}/{scope}, SignedHeaders={names}, Signature={signature}'
        url = 'https://' + self.host + path + ('?' + query_string if query_string else '')
        # Signed headers travel over stdin, never process arguments or logs.
        config = 'url = ' + json.dumps(url) + '\n'
        config += ''.join('header = ' + json.dumps(k + ': ' + v) + '\n' for k, v in headers.items())
        with tempfile.TemporaryDirectory(prefix='.s3-', dir=DIRECTORY) as directory:
            command = ['curl', '--config', '-', '--silent', '--fail', '--proto', '=https',
                       '--max-time', '120', '--request', method]
            if method == 'PUT':
                payload = Path(directory) / 'encrypted-body'
                payload.write_bytes(body)
                command += ['--data-binary', '@' + str(payload)]
            result = subprocess.run(command, input=config.encode(), stdout=subprocess.PIPE,
                                    stderr=subprocess.DEVNULL, timeout=130)
        if result.returncode:
            raise RuntimeError('B2 S3 request failed')
        return result.stdout

    def listing(self):
        objects = []
        query = {'versions': '', 'max-keys': '1000'}
        while True:
            root = ET.fromstring(self.request('GET', query=query))
            for tag in ['Version', 'DeleteMarker']:
                for item in root.findall('s:' + tag, NS):
                    objects.append({'key': item.findtext('s:Key', namespaces=NS),
                                    'version': item.findtext('s:VersionId', namespaces=NS),
                                    'size': int(item.findtext('s:Size', default='0', namespaces=NS)),
                                    'timestamp': dt.datetime.fromisoformat(item.findtext('s:LastModified', namespaces=NS).replace('Z', '+00:00')).timestamp(),
                                    'marker': tag == 'DeleteMarker'})
            if root.findtext('s:IsTruncated', namespaces=NS) != 'true':
                return objects
            query['key-marker'] = root.findtext('s:NextKeyMarker', namespaces=NS)
            query['version-id-marker'] = root.findtext('s:NextVersionIdMarker', namespaces=NS)
            if not query['key-marker'] or not query['version-id-marker']:
                raise RuntimeError('Incomplete bucket pagination')

    def delete(self, obj):
        # Permanent version deletion avoids accumulating hidden B2 versions.
        self.request('DELETE', obj['key'], {'versionId': obj['version']})


def kind(obj):
    match = PATTERN.fullmatch(obj['key'])
    return match[1] if match and not obj.get('marker') else None


def tier_keep(objects, backup_type):
    ordered = sorted((o for o in objects if kind(o) == backup_type), key=lambda o: o['timestamp'], reverse=True)
    keep = set()
    tiers = [('daily', 7), ('weekly', 4), ('monthly', 6)] if backup_type == 'database' else [('weekly', 4), ('monthly', 3)]
    for period, count in tiers:
        seen = set()
        for obj in ordered:
            date = dt.datetime.fromtimestamp(obj['timestamp'], dt.timezone.utc)
            bucket = date.strftime('%Y-%m-%d') if period == 'daily' else date.strftime('%G-%V') if period == 'weekly' else date.strftime('%Y-%m')
            if bucket not in seen and len(seen) < count:
                seen.add(bucket)
                keep.add(obj['version'])
    return keep


def plan(objects, incoming):
    """Tier retention, then emergency pressure pruning; preserve newest of each type."""
    keep = tier_keep(objects, 'database') | tier_keep(objects, 'vm')
    expired = [o for o in objects if kind(o) and o['version'] not in keep]
    remaining = [o for o in objects if o not in expired]
    newest = {max((o for o in objects if kind(o) == t), key=lambda o: o['timestamp'])['version']
              for t in ['database', 'vm'] if any(kind(o) == t for o in objects)}
    total = sum(o['size'] for o in remaining)
    # First daily dumps beyond the newest seven; then oldest VM bundles.
    database = sorted((o for o in remaining if kind(o) == 'database'), key=lambda o: o['timestamp'], reverse=True)[7:]
    vm = sorted((o for o in remaining if kind(o) == 'vm'), key=lambda o: o['timestamp'])
    for obj in sorted(database, key=lambda o: o['timestamp']) + vm:
        if total + incoming <= B2_BUDGET_BYTES:
            break
        if obj['version'] not in newest:
            expired.append(obj)
            total -= obj['size']
    return expired, total + incoming <= B2_BUDGET_BYTES


def admit(client, size):
    objects = client.listing()
    expired, allowed = plan(objects, size)
    for obj in expired:
        client.delete(obj)
    # Confirm actual disappearance and account for ALL versions/foreign objects.
    actual = client.listing()
    if any((o['key'], o['version']) in {(e['key'], e['version']) for e in expired} for o in actual):
        raise RuntimeError('Expired version still present')
    if not allowed or sum(o['size'] for o in actual) + size > B2_BUDGET_BYTES:
        raise RuntimeError('Bucket storage budget exceeded')
    return actual


def save(state):
    pending = STATE.with_suffix('.tmp')
    pending.write_text(json.dumps(state) + '\n')
    pending.replace(STATE)


def metrics(state):
    records = [r for r in state.get('uploads', []) if r['timestamp'] >= time.time() - 30 * 86400]
    daily = {}
    for record in records:
        day = int(record['timestamp'] // 86400)
        daily[day] = daily.get(day, 0) + record['size']
    # Conservative projection: count all upload bytes, without assuming future pruning.
    span = max(1, int(time.time() // 86400) - min(daily, default=int(time.time() // 86400)) + 1)
    projection = state.get('bucket_bytes', 0) + sum(daily.values()) / span * 60
    values = {'bucket_bytes': state.get('bucket_bytes', 0), 'budget_bytes': B2_BUDGET_BYTES,
              'projected_60d_bytes': projection, 'last_attempt_success': state.get('last_attempt_success', 0)}
    for t in ['database', 'vm']:
        values[t + '_success_timestamp_seconds'] = state.get(t + '_success', 0)
    output = ''.join(f'# TYPE news_digest_offsite_{key} gauge\nnews_digest_offsite_{key} {value}\n' for key, value in values.items())
    pending = METRICS.with_suffix('.tmp')
    pending.write_text(output)
    pending.chmod(0o644)
    pending.replace(METRICS)


def upload(client, config, source, backup_type, state, temp):
    encrypted = temp / (backup_type + '.age')
    subprocess.run([str(HOME / '.local/bin/age'), '-r', config['BACKUP_AGE_RECIPIENT'], '-o', str(encrypted), str(source)],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    data = encrypted.read_bytes()
    checksum = hashlib.sha256(data).hexdigest()
    key = backup_type + '/' + time.strftime('%Y%m%dT%H%M%SZ', time.gmtime()) + '-' + checksum[:12] + '.age'
    admit(client, len(data))
    client.request('PUT', key, body=data)
    if hashlib.sha256(client.request('GET', key)).hexdigest() != checksum:
        raise RuntimeError('Downloaded encrypted checksum differs')
    objects = client.listing()
    if not any(o['key'] == key and o['size'] == len(data) for o in objects):
        raise RuntimeError('Uploaded object missing from listing')
    now = time.time()
    state[backup_type + '_success'] = now
    state['bucket_bytes'] = sum(o['size'] for o in objects)
    state.setdefault('uploads', []).append({'type': backup_type, 'key': key, 'timestamp': now, 'size': len(data), 'sha256': checksum})
    state['uploads'] = [r for r in state['uploads'] if r['timestamp'] >= now - 30 * 86400]
    save(state)
    print(f'B2 {backup_type}: {len(data)} bytes; encrypted download SHA256 matched; bucket {state["bucket_bytes"]}/{B2_BUDGET_BYTES} bytes ({state["bucket_bytes"] / B2_BUDGET_BYTES * 100:.3f}%)')


def vm_bundle(target):
    def include(info):
        # No log/metrics/cache trees or local database dump history.
        parts = Path(info.name).parts
        if any(p in {'backups', 'logs', 'metrics', 'cache', 'caches', '__pycache__'} for p in parts):
            return None
        if info.issym() or info.islnk() or not (info.isfile() or info.isdir()):
            return None
        return info
    with tarfile.open(target, 'w:gz') as archive:
        for relative in ['.config/news-digest/env', '.config/systemd/user', '.local/state/news-digest']:
            source = HOME / relative
            if not source.exists():
                raise RuntimeError('Required rebuild path missing')
            archive.add(source, arcname=relative, filter=include)
        # System-wide observability units/configuration are needed for a rebuild.
        for source in [Path('/etc/systemd/system'), Path('/etc/news-digest-observability')]:
            for file in source.glob('obs-*' if source.name == 'system' else '*'):
                if file.is_file() and not file.is_symlink():
                    archive.add(file, arcname='system/' + str(file).lstrip('/'), filter=include)


def main():
    if 13 <= time.gmtime().tm_hour < 16:
        print('Offsite backup skipped during edition protection')
        return
    os.umask(0o077)
    DIRECTORY.mkdir(mode=0o700, parents=True, exist_ok=True)
    DIRECTORY.chmod(0o700)
    with (DIRECTORY / '.offsite.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        state = json.loads(STATE.read_text()) if STATE.exists() else {}
        try:
            config = settings()
            client = S3(config)
            manifests = sorted(DIRECTORY.glob('news-digest-*.json'))
            if not manifests:
                raise RuntimeError('No completed local dump')
            manifest = manifests[-1]
            metadata = json.loads(manifest.read_text())
            dump = manifest.with_suffix('.dump')
            if hashlib.sha256(dump.read_bytes()).hexdigest() != metadata['sha256']:
                raise RuntimeError('Local dump checksum differs')
            if time.time() - metadata['completed_at'] > 26 * 3600:
                raise RuntimeError('Local dump stale')
            with tempfile.TemporaryDirectory(prefix='.offsite-', dir=DIRECTORY) as directory:
                temp = Path(directory)
                if state.get('database_manifest') != manifest.name:
                    upload(client, config, dump, 'database', state, temp)
                    state['database_manifest'] = manifest.name
                    save(state)
                if time.time() - state.get('vm_success', 0) >= 7 * 86400:
                    bundle = temp / 'vm.tar.gz'
                    vm_bundle(bundle)
                    upload(client, config, bundle, 'vm', state, temp)
            state['bucket_bytes'] = sum(o['size'] for o in client.listing())
            state['last_attempt_success'] = 1
        except Exception:
            state['last_attempt_success'] = 0
            # Never print exceptions: provider failures may contain signed URLs.
            print('Offsite backup failed; local dumps and editions are unaffected')
            raise
        finally:
            save(state)
            metrics(state)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        raise SystemExit(1)
