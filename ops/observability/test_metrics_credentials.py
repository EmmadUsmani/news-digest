import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('credentials', Path(__file__).with_name('metrics-credentials.py'))
credentials = importlib.util.module_from_spec(spec)
spec.loader.exec_module(credentials)


class CredentialsTest(unittest.TestCase):
    def test_only_allowed_keys_and_private_permissions(self):
        with tempfile.TemporaryDirectory() as directory:
            source, target = Path(directory) / 'source', Path(directory) / 'target'
            content = ''.join(key + '=' + 'a' * 40 + '\n' for key in credentials.KEYS)
            source.write_text('ANTHROPIC_API_KEY=unrelated-secret\n' + content)
            credentials.publish(source, target)
            self.assertEqual(target.read_text(), content)
            self.assertEqual(target.stat().st_mode & 0o777, 0o600)

    def test_invalid_credentials_leave_existing_file_unchanged(self):
        with tempfile.TemporaryDirectory() as directory:
            source, target = Path(directory) / 'source', Path(directory) / 'target'
            target.write_text('previous')
            valid = ''.join(key + '=' + 'a' * 40 + '\n' for key in credentials.KEYS)
            for content in ('', valid.splitlines()[0], valid + valid, valid.replace('a' * 40, 'short'), valid.replace('a' * 40, '"' + 'a' * 40 + '"')):
                source.write_text(content)
                with self.assertRaises(ValueError):
                    credentials.publish(source, target)
                self.assertEqual(target.read_text(), 'previous')


if __name__ == '__main__':
    unittest.main()
