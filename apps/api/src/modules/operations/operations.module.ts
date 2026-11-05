import { Controller, Get, Module } from '@nestjs/common';

import { BrowserErrorsController } from './adapters/browser-errors';
import { MonitoringAlerts } from './adapters/monitoring-alerts';
import { OperationsStatus } from './adapters/operations.status';
import { AlertsReader } from './domain/alerts.reader';
import { OperationsReader } from './domain/operations.reader';
@Controller('api/admin/status')
class OperationsController {
  constructor(
    private readonly status: OperationsReader,
    private readonly alerts: AlertsReader,
  ) {}
  @Get('alerts') readAlerts() {
    return this.alerts.read();
  }
  @Get() read() {
    return this.status.read();
  }
}
@Module({
  controllers: [OperationsController, BrowserErrorsController],
  providers: [
    OperationsStatus,
    MonitoringAlerts,
    { provide: AlertsReader, useExisting: MonitoringAlerts },
    { provide: OperationsReader, useExisting: OperationsStatus },
  ],
  exports: [OperationsStatus],
})
export class OperationsModule {}
