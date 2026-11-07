import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('monitor', Path(__file__).with_name('monitor.py'))
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)


class MonitorTest(unittest.TestCase):
    def check(self, active='active', result='success', exited=950, service_state='inactive', started=0):
        with patch.object(monitor, 'properties', side_effect=[
            {'ActiveState': active},
            {'Result': result, 'ActiveState': service_state,
             'ExecMainExitTimestampMonotonic': str(exited * 1_000_000),
             'ExecMainStartTimestampMonotonic': str(started * 1_000_000)},
        ]), patch.object(monitor.time, 'monotonic', return_value=1000):
            return monitor.collect()

    def test_healthy(self):
        self.assertTrue(self.check())

    def test_dead_timer(self):
        self.assertFalse(self.check(active='inactive'))

    def test_failed_run(self):
        self.assertFalse(self.check(result='exit-code'))

    def test_stalled_run(self):
        self.assertFalse(self.check(exited=800))

    def test_in_progress_run_with_reset_exit_time(self):
        self.assertTrue(self.check(exited=0, service_state='activating', started=999))

    def test_hung_in_progress_run(self):
        self.assertFalse(self.check(exited=0, service_state='activating', started=900))

    def test_never_ran(self):
        self.assertFalse(self.check(exited=0))


if __name__ == '__main__':
    unittest.main()
