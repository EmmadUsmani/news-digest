import importlib.util
import os
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("sessions", Path(__file__).with_name("sessions.py"))
sessions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sessions)


class RetentionTest(unittest.TestCase):
    def test_age_newest_symlinks_and_empty_folders(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "sessions"
            dated = root / "2026/01/01"
            dated.mkdir(parents=True)
            old = dated / "old.jsonl"
            newest = root / "newest.jsonl"
            boundary = root / "boundary.jsonl"
            outside = Path(tmp) / "outside"
            outside.write_text("protected")
            for path, stamp in [(old, 1), (newest, 3), (boundary, 2)]:
                path.write_text("session")
                os.utime(path, (stamp, stamp))
            (root / "link").symlink_to(outside)
            (root / "directory-link").symlink_to(Path(tmp), target_is_directory=True)
            now = 7 * 86400 + 2
            self.assertEqual(sessions.expire(root, now=now)["files"], 1)
            self.assertTrue(old.exists())
            sessions.expire(root, apply=True, now=now)
            self.assertFalse(old.exists())
            self.assertFalse(dated.exists())
            self.assertTrue(newest.exists())
            self.assertTrue(boundary.exists())
            self.assertEqual(outside.read_text(), "protected")
            # Even when every file is stale, preserve the newest session.
            sessions.expire(root, apply=True, now=now + 100)
            self.assertTrue(newest.exists())
            self.assertFalse(boundary.exists())
            self.assertEqual(sessions.expire(root, apply=True, now=now + 100)["files"], 0)


if __name__ == "__main__":
    unittest.main()
