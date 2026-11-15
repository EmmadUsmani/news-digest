"""Isolated deployment checks; the fake builder never invokes Vite or a service."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

with tempfile.TemporaryDirectory() as folder:
    root = Path(folder)
    (root / 'scripts').mkdir()
    web = root / 'apps/web'
    (web / 'dist/assets').mkdir(parents=True)
    (web / 'dist/index.html').write_text('legacy')
    (web / 'dist/assets/legacy.js').write_text('legacy')
    shutil.copy2(Path(__file__).with_name('deploy-web.py'), root / 'scripts/deploy-web.py')
    builder = root / 'pnpm'
    builder.write_text('''#!/usr/bin/env python3
import os, pathlib, sys
if os.environ.get('FAIL_BUILD'): sys.exit(1)
p = pathlib.Path(sys.argv[-1]); (p / 'assets').mkdir(parents=True)
(p / 'index.html').write_text(os.environ['BUILD_ID'])
(p / 'assets' / (os.environ['BUILD_ID'] + '.js')).write_text(os.environ['BUILD_ID'])
''')
    builder.chmod(0o755)
    env = dict(os.environ, PATH=str(root) + ':' + os.environ['PATH'])

    def run(build, fail=False):
        result = subprocess.run(['python3', str(root / 'scripts/deploy-web.py')],
                                env=dict(env, BUILD_ID=build, **({'FAIL_BUILD': '1'} if fail else {})),
                                capture_output=True, text=True)
        assert (result.returncode != 0) == fail, result.stderr

    run('first')
    assert (web / 'dist').is_symlink()
    assert (web / 'dist/assets/legacy.js').read_text() == 'legacy'
    first = (web / 'dist').resolve()
    run('failed', True)
    assert (web / 'dist').resolve() == first
    run('second')
    for asset in ['legacy', 'first', 'second']:
        assert (web / 'dist/assets' / (asset + '.js')).exists()
    # Expired retired releases stop contributing; inherited assets must not live forever.
    for release in (web / '.releases').iterdir():
        if release.is_dir() and release != (web / 'dist').resolve():
            os.utime(release, (time.time() - 86401, time.time() - 86401))
    run('third')
    assert not (web / 'dist/assets/legacy.js').exists()
    assert not (web / 'dist/assets/first.js').exists()
    assert (web / 'dist/assets/second.js').exists()
    assert (web / 'dist/assets/third.js').exists()
    print('PASS: atomic legacy conversion, retained assets, failed build, expiry without inherited-asset leak')
