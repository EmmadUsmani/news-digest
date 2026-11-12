#!/usr/bin/env python3
"""Publish only VictoriaMetrics mutation credentials to its service env file."""
import os
from pathlib import Path
import tempfile

KEYS = ('NEWS_METRICS_deleteAuthKey', 'NEWS_METRICS_forceMergeAuthKey')


def publish(source: Path, target: Path) -> None:
    selected = {}
    for line in source.read_text().splitlines():
        name, separator, value = line.partition('=')
        if separator and name in KEYS:
            # These generated tokens use a restricted alphabet, avoiding dotenv
            # and systemd quoting differences. Refuse unfamiliar values.
            if len(value) < 32 or not all(c.isascii() and (c.isalnum() or c in '_-') for c in value):
                raise ValueError('Invalid metrics mutation key: ' + name)
            if name in selected:
                raise ValueError('Duplicate metrics mutation key: ' + name)
            selected[name] = value
    if set(selected) != set(KEYS):
        raise ValueError('Missing metrics mutation keys')
    fd, temporary = tempfile.mkstemp(prefix='.metrics-env-', dir=target.parent)
    try:
        with os.fdopen(fd, 'w') as output:
            output.write(''.join(name + '=' + selected[name] + '\n' for name in KEYS))
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == '__main__':
    directory = Path.home() / '.config/news-digest'
    publish(directory / 'env', directory / 'metrics.env')
