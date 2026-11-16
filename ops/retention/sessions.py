#!/usr/bin/env python3
"""Expire old session files; preview by default and never follow symlinks."""
import argparse
import json
import os
import stat
import time
from pathlib import Path


def expire(root, apply=False, now=None):
    cutoff = (time.time() if now is None else now) - 7 * 86400
    files = []
    folders = []
    if root.is_symlink() or not root.is_dir():
        return {"files": 0, "bytes": 0}
    for directory, children, names in os.walk(root, followlinks=False):
        children[:] = [name for name in children if not (Path(directory) / name).is_symlink()]
        folders.append(Path(directory))
        for name in names:
            path = Path(directory) / name
            info = path.lstat()
            if stat.S_ISREG(info.st_mode):
                files.append((path, info))
    newest = max(files, key=lambda entry: (entry[1].st_mtime_ns, str(entry[0])), default=None)
    expired = [(path, info) for path, info in files if info.st_mtime < cutoff and (path, info) != newest]
    for path, info in expired:
        print(json.dumps({"action": "delete" if apply else "would-delete", "path": str(path), "bytes": info.st_size}))
        if apply:
            # Recheck so a newly active file survives a concurrent write.
            current = path.lstat()
            if current.st_ino == info.st_ino and current.st_mtime_ns == info.st_mtime_ns:
                path.unlink()
    if apply:
        for directory in reversed(folders):
            if directory != root:
                try:
                    directory.rmdir()
                except OSError:
                    pass  # Nonempty or concurrently used directories survive.
    return {"files": len(expired), "bytes": sum(info.st_size for _, info in expired)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    print(json.dumps(expire(Path.home() / ".codex/sessions", args.apply)))
