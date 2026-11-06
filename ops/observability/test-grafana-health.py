import json
import subprocess
import unittest
from unittest.mock import patch

from grafana_health import healthy


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


if __name__ == '__main__':
    unittest.main()
