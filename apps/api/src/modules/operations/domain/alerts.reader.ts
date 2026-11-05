import type { MonitoringAlerts } from '@digest/contracts';
export abstract class AlertsReader {
  abstract read(): Promise<MonitoringAlerts>;
}
