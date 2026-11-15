"""Build off-line, retain hashed assets, and atomically publish on Linux."""
import ctypes
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
import uuid

WEB = Path(__file__).resolve().parents[1] / 'apps/web'
RELEASES = WEB / '.releases'
RELEASES.mkdir(exist_ok=True)


def own_assets(release):
    manifest = release / '.assets.json'
    return json.loads(manifest.read_text()) if manifest.exists() else [
        p.name for p in (release / 'assets').iterdir() if p.is_file()
    ]


def deploy():
    stage = RELEASES / str(uuid.uuid4())
    live = WEB / 'dist'
    link = WEB / '.dist-next'
    try:
        subprocess.run(['pnpm', 'exec', 'vite', 'build', '--outDir', str(stage)], cwd=WEB, check=True)
        assert (stage / 'index.html').is_file(), 'build lacks index.html'
        assets = own_assets(stage)
        (stage / '.assets.json').write_text(json.dumps(assets))
        current = live.resolve() if live.exists() else None
        now = time.time()
        retained = [p for p in RELEASES.iterdir() if p.is_dir() and p != stage
                    and (p == current or now - p.stat().st_mtime < 86400)]
        if current and current not in retained:
            retained.append(current)
        for release in retained:
            for name in own_assets(release):
                source = release / 'assets' / name
                target = stage / 'assets' / name
                if not target.exists():
                    shutil.copy2(source, target)
        link.unlink(missing_ok=True)
        link.symlink_to(stage.relative_to(WEB), target_is_directory=True)
        if live.exists() and not live.is_symlink():
            # Initial directory-to-symlink conversion must also be atomic.
            libc = ctypes.CDLL(None, use_errno=True)
            if libc.renameat2(-100, os.fsencode(link), -100, os.fsencode(live), 2):
                raise OSError(ctypes.get_errno(), 'atomic directory exchange failed')
            legacy = RELEASES / ('legacy-' + str(uuid.uuid4()))
            link.rename(legacy)
            os.utime(legacy, None)
        else:
            os.replace(link, live)
            if current:
                os.utime(current, None)  # retention starts when retired
        for release in RELEASES.iterdir():
            if release.is_dir() and release != stage and time.time() - release.stat().st_mtime >= 86400:
                shutil.rmtree(release)
        print('Web published atomically; previous hashed assets retained for >=24 hours.')
    finally:
        link.unlink(missing_ok=True)
        if stage.exists() and live.resolve() != stage:
            shutil.rmtree(stage)


with (RELEASES / '.deploy.lock').open('w') as lock:
    fcntl.flock(lock, fcntl.LOCK_EX)
    deploy()
