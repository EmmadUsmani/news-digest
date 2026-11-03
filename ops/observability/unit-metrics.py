#!/usr/bin/env python3
"""Read only explicit user units; write a single atomic node_exporter textfile."""
import os
from pathlib import Path
import subprocess
import time

rows = []
for scope, units in [
    ('user', [f'news-digest-{role}.service' for role in ['api', 'worker', 'docs', 'schema', 'agent']]),
    ('system', [f'obs-{role}.service' for role in ['logs', 'shipper', 'metrics', 'node', 'grafana', 'redis', 'postgres']]),
]:
    result = subprocess.run(
        ['systemctl', *(['--user'] if scope == 'user' else []), 'show', *units,
         '--property=Id,ActiveState,MemoryCurrent,CPUUsageNSec,TasksCurrent,NRestarts'],
        check=True, capture_output=True, text=True, timeout=5,
    )
    for block in result.stdout.strip().split('\n\n'):
        fields = dict(line.split('=', 1) for line in block.splitlines() if '=' in line)
        unit = fields['Id']
        if unit not in units:
            raise ValueError('Unexpected unit')
        labels = f'{{unit="{unit}",scope="{scope}"}}'
        rows.append(f'news_digest_unit_active{labels} {int(fields.get("ActiveState") == "active")}')
        for field, metric, factor in [
            ('MemoryCurrent', 'memory_bytes', 1),
            ('CPUUsageNSec', 'cpu_seconds_total', 1e-9),
            ('TasksCurrent', 'tasks', 1),
            ('NRestarts', 'restarts_total', 1),
        ]:
            value = fields.get(field, '')
            if value.isdecimal():
                rows.append(f'news_digest_unit_{metric}{labels} {int(value) * factor}')
rows.append(f'news_digest_unit_snapshot_timestamp_seconds {time.time()}')
path = Path('/var/lib/news-digest-node-textfile/user-units.prom')
temporary = path.with_suffix('.tmp')
temporary.write_text('\n'.join(rows) + '\n')
os.replace(temporary, path)
