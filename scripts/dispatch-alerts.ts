import { join } from 'node:path';

import { dispatchAlerts } from './lib/alerting/dispatcher';
import {
  alertDirectory,
  FileAlertDestination,
} from './lib/alerting/file-destination';

// Register destinations here. The dispatcher only knows the generic port.
const destinations = [new FileAlertDestination()];

void dispatchAlerts({
  statePath: join(alertDirectory, 'state.json'),
  destinations,
  readAlerts: async () => {
    const response = await fetch('http://127.0.0.1:8880/api/v1/alerts', {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('Evaluator unavailable');
    return response.json();
  },
}).then(
  ({ failures }) => {
    process.exitCode = failures ? 1 : 0;
  },
  () => {
    console.error(
      'Alert dispatcher failed; inspect local state and destination permissions',
    );
    process.exitCode = 1;
  },
);
