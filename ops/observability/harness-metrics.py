#!/usr/bin/env python3
"""Export allowlisted numeric supervisor status; never read logs or transcripts."""
import datetime
import json
from pathlib import Path


def timestamp(value):
    if not isinstance(value, str):
        raise ValueError('Timestamp must be a string')
    parsed = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('Timestamp requires timezone')
    return parsed.timestamp()


def read_object(path):
    # Bound even malformed input. Never put input values in errors or labels.
    with path.open('rb') as stream:
        raw = stream.read(16385)
    if len(raw) > 16384:
        raise ValueError('Status too large')
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise ValueError('Status must be an object')
    return value


def collect(directory):
    rows = []
    for source in ['heartbeat', 'usage']:
        samples = []
        try:
            value = read_object(directory / f'{source}.json')
            if source == 'heartbeat':
                for field, suffix in [('iteration', 'iteration'),
                                      ('last_exit_code', 'previous_exit_code'),
                                      ('consecutive_no_progress', 'no_progress_streak')]:
                    number = value[field]
                    if type(number) is not int or number < 0:
                        raise ValueError('Invalid integer')
                    samples.append(f'news_digest_harness_{suffix} {number}')
                # Optional so a supervisor installed before the field existed still exports.
                if 'consecutive_failures' in value:
                    number = value['consecutive_failures']
                    if type(number) is not int or number < 0:
                        raise ValueError('Invalid integer')
                    samples.append(f'news_digest_harness_failure_streak {number}')
                for field, suffix in [('updated_at', 'heartbeat_timestamp_seconds'),
                                      ('iteration_started_at', 'iteration_started_timestamp_seconds')]:
                    samples.append(f'news_digest_harness_{suffix} {timestamp(value[field])}')
                if value.get('iteration_finished_at'):
                    finished = timestamp(value['iteration_finished_at'])
                    duration = finished - timestamp(value['iteration_started_at'])
                    if duration < 0:
                        raise ValueError('Finish precedes start')
                    samples.append('news_digest_harness_iteration_finished_timestamp_seconds '
                                   + str(finished))
                    samples.append(f'news_digest_harness_completed_iteration_duration_seconds {duration}')
                if value.get('next_retry_at'):
                    samples.append('news_digest_harness_next_retry_timestamp_seconds '
                                   + str(timestamp(value['next_retry_at'])))
            else:
                samples.append('news_digest_harness_usage_timestamp_seconds '
                               + str(timestamp(value['observed_at'])))
                # Window identity comes from its duration, not primary/secondary position.
                for window in ['primary', 'secondary']:
                    quota = value.get(window)
                    if not isinstance(quota, dict) or quota.get('window_minutes') != 10080:
                        continue
                    percent = quota['used_percent']
                    if type(percent) not in (int, float) or not 0 <= percent <= 100:
                        raise ValueError('Invalid quota')
                    samples.append(f'news_digest_harness_weekly_used_percent {percent}')
                    break
            rows.extend(samples)
            ok = 1
        except (OSError, ValueError, KeyError, TypeError, OverflowError, RecursionError):
            ok = 0
        rows.append(f'news_digest_harness_status_read_success{{source="{source}"}} {ok}')
    return rows


if __name__ == '__main__':
    print('\n'.join(collect(Path.home() / 'agent-control/status')))
