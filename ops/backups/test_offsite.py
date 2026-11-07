import datetime as dt
import importlib.util
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('offsite', Path(__file__).with_name('offsite.py'))
backup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backup)


def obj(t, day, size=100):
    timestamp = dt.datetime(2026, 11, 7, tzinfo=dt.timezone.utc).timestamp() - day * 86400
    stamp = dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    return {'key': f'{t}/{stamp}-0123456789ab.age', 'timestamp': timestamp,
            'size': size, 'version': t + str(day), 'marker': False}


class Client:
    def __init__(self, objects, stuck=False):
        self.objects = objects.copy()
        self.stuck = stuck
        self.deleted = []

    def listing(self):
        return self.objects.copy()

    def delete(self, item):
        self.deleted.append(item)
        if not self.stuck:
            self.objects.remove(item)


class OffsiteTests(unittest.TestCase):
    def test_tiers_daily_weekly_monthly_and_vm(self):
        objects = [obj('database', d) for d in range(230)] + [obj('vm', d) for d in range(0, 150, 7)]
        deleted, allowed = backup.plan(objects, 100)
        self.assertTrue(allowed)
        remaining = [o for o in objects if o not in deleted]
        self.assertTrue(all(obj('database', d) in remaining for d in range(7)))
        for t, months in [('database', 6), ('vm', 3)]:
            retained = {dt.datetime.fromtimestamp(o['timestamp'], dt.timezone.utc).strftime('%Y-%m') for o in remaining if backup.kind(o) == t}
            self.assertEqual(len(retained), months)
        self.assertIn(obj('vm', 21), remaining)
        self.assertNotIn(obj('vm', 140), remaining)

    def test_under_budget_foreign_and_all_versions_count(self):
        foreign = {'key': 'foreign', 'size': 1000, 'version': 'foreign'}
        objects = [obj('database', 0), obj('vm', 0), foreign]
        deleted, allowed = backup.plan(objects, 100)
        self.assertEqual(deleted, [])
        self.assertTrue(allowed)
        with patch.object(backup, 'B2_BUDGET_BYTES', 1250):
            self.assertFalse(backup.plan(objects, 100)[1])
        self.assertEqual(objects[-1], foreign)

    def test_pressure_deletes_database_beyond_seven_then_vm(self):
        objects = [obj('database', d) for d in range(8)] + [obj('vm', d) for d in [0, 7, 14]]
        with patch.object(backup, 'B2_BUDGET_BYTES', 1000):
            client = Client(objects)
            remaining = backup.admit(client, 100)
        self.assertEqual([o['version'] for o in client.deleted], ['database7', 'vm14'])
        self.assertEqual(sum(o['size'] for o in remaining), 900)

    def test_still_over_never_deletes_newest_or_foreign(self):
        objects = [obj('database', 0, 600), obj('vm', 0, 600)]
        with patch.object(backup, 'B2_BUDGET_BYTES', 1000):
            client = Client(objects)
            with self.assertRaisesRegex(RuntimeError, 'budget'):
                backup.admit(client, 100)
        self.assertEqual(client.deleted, [])

    def test_deletion_must_really_disappear(self):
        client = Client([obj('database', d) for d in range(230)], stuck=True)
        with self.assertRaisesRegex(RuntimeError, 'still present'):
            backup.admit(client, 100)

    def test_download_checksum_failure_does_not_record_success(self):
        class BadDownload(Client):
            def request(self, method, key, body=b''):
                return b'changed' if method == 'GET' else b''
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            state = {}
            def encrypt(*args, **kwargs):
                (root / 'database.age').write_bytes(b'age-encryption.org/v1\nfixture')
            with patch.object(backup.subprocess, 'run', side_effect=encrypt):
                with self.assertRaisesRegex(RuntimeError, 'checksum'):
                    backup.upload(BadDownload([]), {'BACKUP_AGE_RECIPIENT': 'fixture'}, root / 'dump', 'database', state, root)
            self.assertEqual(state, {})

    def test_bundle_has_env_state_units_but_no_logs_backups_or_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            paths = ['.config/news-digest/env', '.config/systemd/user/app.service',
                     '.local/state/news-digest/value.json', '.local/state/news-digest/backups/old.dump',
                     '.local/state/news-digest/logs/app.log']
            for name in paths:
                path = home / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('private fixture')
            (home / '.local/state/news-digest/link').symlink_to('/etc/passwd')
            target = home / 'vm.tar.gz'
            with patch.object(backup, 'HOME', home):
                backup.vm_bundle(target)
            with tarfile.open(target) as archive:
                names = archive.getnames()
            self.assertIn('.config/news-digest/env', names)
            self.assertIn('.local/state/news-digest/value.json', names)
            self.assertFalse(any('old.dump' in n or 'app.log' in n or n.endswith('/link') for n in names))

    def test_curl_keeps_signed_headers_out_of_arguments(self):
        config = {'B2_ENDPOINT': 's3.us-east-005.backblazeb2.com',
                  'B2_BUCKET': 'fixture', 'B2_KEY_ID': 'private-key-id',
                  'B2_APPLICATION_KEY': 'private-application-key'}
        class Result:
            returncode = 0
            stdout = b'fixture'
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(backup, 'DIRECTORY', Path(directory)):
                with patch.object(backup.subprocess, 'run', return_value=Result()) as call:
                    self.assertEqual(backup.S3(config).request('GET'), b'fixture')
                    arguments = ' '.join(call.call_args.args[0])
                    self.assertNotIn(config['B2_KEY_ID'], arguments)
                    self.assertNotIn(config['B2_APPLICATION_KEY'], arguments)
                    self.assertIn(b'Authorization:', call.call_args.kwargs['input'])

    def test_projection_and_stale_metrics(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / 'metrics.prom'
            with patch.object(backup, 'METRICS', target), patch.object(backup.time, 'time', return_value=100 * 86400):
                backup.metrics({'bucket_bytes': 100, 'database_success': 123,
                                'uploads': [{'timestamp': 100 * 86400, 'size': 10},
                                            {'timestamp': 69 * 86400, 'size': 1000000000}]})
            text = target.read_text()
            self.assertIn('news_digest_offsite_projected_60d_bytes 700.0', text)
            self.assertIn('news_digest_offsite_vm_success_timestamp_seconds 0', text)


if __name__ == '__main__':
    unittest.main()
