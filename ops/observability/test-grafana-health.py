import json
import subprocess
import unittest
from unittest.mock import patch

from grafana_health import healthy, wait_until_healthy


class GrafanaHealthTest(unittest.TestCase):
    def test_database_health_is_required(self):
        for body, expected in [({'database': 'ok'}, True), ({'database': 'failed'}, False),
                               ({}, False), ([], False)]:
            with self.subTest(body=body), patch('grafana_health.subprocess.run') as run:
                run.return_value.stdout = json.dumps(body)
                self.assertEqual(healthy(), expected)
                args, kwargs = run.call_args
                self.assertIn('--fail', args[0])
                self.assertIn('--max-time', args[0])
                self.assertEqual(kwargs['timeout'], 3)

    def test_failures_are_unhealthy(self):
        for error in [subprocess.TimeoutExpired('curl', 3),
                      subprocess.CalledProcessError(22, 'curl'), OSError('unavailable')]:
            with self.subTest(error=error), patch('grafana_health.subprocess.run', side_effect=error):
                self.assertFalse(healthy())
        with patch('grafana_health.subprocess.run') as run:
            run.return_value.stdout = 'invalid JSON'
            self.assertFalse(healthy())

    def test_startup_waits_for_http_health(self):
        with patch('grafana_health.healthy', side_effect=[False, True]) as probe, \
                patch('grafana_health.time.monotonic', side_effect=[0, 0, 1]), \
                patch('grafana_health.time.sleep') as sleep:
            self.assertTrue(wait_until_healthy())
            self.assertEqual(probe.call_count, 2)
            sleep.assert_called_once_with(1)

    def test_startup_wait_has_a_deadline(self):
        with patch('grafana_health.healthy') as probe, \
                patch('grafana_health.time.monotonic', side_effect=[0, 91]):
            self.assertFalse(wait_until_healthy())
            probe.assert_not_called()


if __name__ == '__main__':
    unittest.main()
