import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('harness', Path(__file__).with_name('harness-metrics.py'))
harness = importlib.util.module_from_spec(spec)
spec.loader.exec_module(harness)


class HarnessMetricsTest(unittest.TestCase):
    def test_status_is_numeric_and_private(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            status = dict(iteration=438, last_exit_code=0, consecutive_no_progress=2,
                          updated_at='2026-11-03T16:32:43Z',
                          iteration_started_at='2026-11-03T16:32:43Z',
                          iteration_finished_at='', stop_reason='PRIVATE', codex_usage='PRIVATE')
            (path / 'heartbeat.json').write_text(json.dumps(status))
            (path / 'usage.json').write_text(json.dumps(dict(
                primary=dict(window_minutes=300, used_percent=99),
                secondary=dict(window_minutes=10080, used_percent=17),
                observed_at='2026-11-03T16:32:43Z')))
            rows = '\n'.join(harness.collect(path))
            self.assertIn('news_digest_harness_iteration 438', rows)
            self.assertIn('news_digest_harness_weekly_used_percent 17', rows)
            self.assertNotIn('PRIVATE', rows)
            self.assertNotIn('finished_timestamp', rows)
            self.assertNotIn('completed_iteration_duration', rows)
            self.assertNotIn('next_retry_timestamp', rows)
            self.assertNotIn('99', rows)
            status['iteration_finished_at'] = '2026-11-03T16:33:43Z'
            (path / 'heartbeat.json').write_text(json.dumps(status))
            self.assertIn('finished_timestamp', '\n'.join(harness.collect(path)))
            self.assertNotIn('failure_streak', rows)
            status['consecutive_failures'] = 3
            (path / 'heartbeat.json').write_text(json.dumps(status))
            self.assertIn('news_digest_harness_failure_streak 3', '\n'.join(harness.collect(path)))

    def test_completed_duration_and_reported_retry_do_not_infer_activity(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            status = dict(iteration=440, last_exit_code=0, consecutive_no_progress=0,
                          updated_at='2026-11-03T16:33:43Z',
                          iteration_started_at='2026-11-03T17:32:43+01:00',
                          iteration_finished_at='2026-11-03T16:33:43Z',
                          next_retry_at='2026-11-03T16:34:43Z')
            def collect():
                (path / 'heartbeat.json').write_text(json.dumps(status))
                return '\n'.join(harness.collect(path))
            rows = collect()
            self.assertIn('completed_iteration_duration_seconds 60.0', rows)
            self.assertIn('next_retry_timestamp_seconds ' + str(harness.timestamp(status['next_retry_at'])), rows)
            # A new running iteration removes the completed sample, never exports elapsed time.
            status['iteration_finished_at'] = ''
            self.assertNotIn('completed_iteration_duration', collect())
            for field, invalid in [('iteration_finished_at', '2026-11-03T16:32:42Z'),
                                   ('iteration_finished_at', 'bad'),
                                   ('next_retry_at', '2026-11-03T16:34:43')]:
                status['iteration_finished_at'] = ''
                status['next_retry_at'] = ''
                status[field] = invalid
                rows = collect()
                self.assertIn('source="heartbeat"} 0', rows)
                self.assertNotIn('news_digest_harness_iteration ', rows)

    def test_invalid_sources_fail_independently_without_stale_values(self):
        for content in ['{', '[]', 'x' * 16385, '[' * 2000 + ']' * 2000, json.dumps(dict(iteration=True)), '{}']:
            with self.subTest(content=content[:20]), tempfile.TemporaryDirectory() as directory:
                path = Path(directory)
                (path / 'heartbeat.json').write_text(content)
                rows = harness.collect(path)
                self.assertEqual(rows, [
                    'news_digest_harness_status_read_success{source="heartbeat"} 0',
                    'news_digest_harness_status_read_success{source="usage"} 0'])

    def test_missing_weekly_is_unknown_and_bad_quota_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            usage = dict(observed_at='2026-11-03T16:32:43Z', primary=None)
            (path / 'usage.json').write_text(json.dumps(usage))
            self.assertNotIn('weekly_used', '\n'.join(harness.collect(path)))
            for percent in [float('nan'), float('inf'), -1, 101, True, '17']:
                usage['primary'] = dict(window_minutes=10080, used_percent=percent)
                (path / 'usage.json').write_text(json.dumps(usage))
                rows = '\n'.join(harness.collect(path))
                self.assertNotIn('usage_timestamp', rows)
                self.assertIn('source="usage"} 0', rows)


if __name__ == '__main__':
    unittest.main()
