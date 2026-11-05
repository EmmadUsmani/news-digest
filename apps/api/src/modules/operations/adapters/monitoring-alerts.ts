import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

import { AlertsReader } from '../domain/alerts.reader';

const responseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    alerts: z.array(
      z.object({ state: z.enum(['firing', 'pending', 'inactive']) }),
    ),
  }),
});

@Injectable()
export class MonitoringAlerts extends AlertsReader {
  async read() {
    try {
      const response = await fetch('http://127.0.0.1:8880/api/v1/alerts', {
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) throw new Error('Monitoring unavailable');
      const { data } = responseSchema.parse(await response.json());
      return {
        checkedAt: new Date().toISOString(),
        firing: data.alerts.filter((alert) => alert.state === 'firing').length,
        pending: data.alerts.filter((alert) => alert.state === 'pending')
          .length,
      };
    } catch {
      throw new ServiceUnavailableException('Monitoring alerts unavailable');
    }
  }
}
