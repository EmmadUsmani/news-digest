import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('database_backup', Path(__file__).with_name('database.py'))
backup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backup)


class BackupTests(unittest.TestCase):
    def test_retention_only_deletes_completed_old_pairs(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            for stem, age in [('news-digest-old', 8), ('news-digest-keep', 6)]:
                for suffix in ['.dump', '.json']:
                    file = root / (stem + suffix)
                    file.write_text('data')
                    os.utime(file, (1000000 - age * 86400,) * 2)
            (root / 'unrelated.dump').touch()
            (root / 'restore-proof.json').touch()
            backup.prune(root, 1000000)
            self.assertFalse((root / 'news-digest-old.dump').exists())
            self.assertFalse((root / 'news-digest-old.json').exists())
            self.assertTrue((root / 'news-digest-keep.dump').exists())
            self.assertTrue((root / 'unrelated.dump').exists())
            self.assertTrue((root / 'restore-proof.json').exists())

    def test_metric_ignores_partial_or_missing_dump_and_keeps_last_success(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            metric = root / 'metric.prom'
            backup.publish_metric(root, metric)
            self.assertTrue(metric.read_text().endswith(' 0\n'))
            (root / 'news-digest-ok.json').write_text(json.dumps({'completed_at': 1234}))
            (root / 'news-digest-ok.dump').touch()
            (root / 'news-digest-missing.json').write_text(json.dumps({'completed_at': 2000}))
            (root / 'news-digest-new.json.partial').write_text('{}')
            backup.publish_metric(root, metric)
            self.assertTrue(metric.read_text().endswith(' 1234\n'))

    def test_corrupted_dump_rejected_before_container_creation(self):
        with tempfile.TemporaryDirectory() as temp, patch.object(backup, 'run') as run:
            root = Path(temp)
            (root / 'news-digest-test.json').write_text(json.dumps({'sha256': 'wrong'}))
            (root / 'news-digest-test.dump').write_bytes(b'corrupt')
            with patch.object(backup, 'DIRECTORY', root):
                with self.assertRaisesRegex(RuntimeError, 'checksum mismatch'):
                    backup.restore()
            run.assert_not_called()

    def test_failed_dump_does_not_publish_success_or_prune(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            session = unittest.mock.MagicMock()
            session.stdout.readline.return_value = 'snapshot\n'
            session.poll.return_value = 0
            compose = unittest.mock.MagicMock(stdout='container')
            with patch.object(backup, 'DIRECTORY', root), patch.object(backup, 'connection', return_value=session), \
                 patch.object(backup, 'counts', return_value={'topics': 4}), \
                 patch.object(backup, 'run', side_effect=[compose, RuntimeError('failed dump')]), \
                 patch.object(backup, 'publish_metric') as metric, patch.object(backup, 'prune') as prune:
                with self.assertRaises(RuntimeError):
                    backup.backup()
                metric.assert_not_called()
                prune.assert_not_called()
                self.assertEqual(list(root.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
