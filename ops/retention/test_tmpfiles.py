"""Verify the host tmpfiles implementation protects locked files and sockets."""
import fcntl
import socket
import subprocess
import tempfile
import time
import unittest
from pathlib import Path


class TmpfilesTest(unittest.TestCase):
    def test_in_use_entries_survive(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "clean"
            root.mkdir()
            stale = root / "stale"
            stale.write_text("expired")
            locked = root / "locked"
            with locked.open("w") as handle, socket.socket(socket.AF_UNIX) as server:
                fcntl.flock(handle, fcntl.LOCK_EX)
                server.bind(str(root / "socket"))
                config = Path(tmp) / "rule.conf"
                config.write_text(f"q {root} 1777 - - 1s\n")
                time.sleep(2)
                recent = root / "recent"
                recent.write_text("keep")
                subprocess.run(["systemd-tmpfiles", "--clean", str(config)], check=True)
                self.assertFalse(stale.exists())
                self.assertTrue(locked.exists())
                self.assertTrue((root / "socket").exists())
                self.assertTrue(recent.exists())


if __name__ == "__main__":
    unittest.main()
