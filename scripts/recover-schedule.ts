import { protectSchedule } from './lib/schedule-recovery';

void protectSchedule('http://localhost:8000', true)
  .then((restore) => restore())
  .then(() =>
    console.log('Saved schedule restored and recovery record removed.'),
  )
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
