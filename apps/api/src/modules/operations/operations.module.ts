import {
  Controller,
  type DynamicModule,
  Get,
  Inject,
  Module,
} from '@nestjs/common';

import {
  PUBLIC_STATUS,
  PublicStatusController,
} from '../../public-read/status.controller';
import { PublicStatusModule } from '../../public-read/status.module';
import { BrowserErrorsController } from './adapters/browser-errors';
import { MonitoringAlerts } from './adapters/monitoring-alerts';
import { OperationsStatus } from './adapters/operations.status';
import { AlertsReader } from './domain/alerts.reader';
import { OperationsReader } from './domain/operations.reader';
@Controller('api/admin/status')
class OperationsController {
  constructor(
    @Inject(OperationsReader) private readonly status: OperationsReader,
  ) {}
  @Get() read() {
    return this.status.read();
  }
}
@Controller('api/admin/status/alerts')
class OperationsAlertsController {
  constructor(@Inject(AlertsReader) private readonly alerts: AlertsReader) {}
  @Get() read() {
    return this.alerts.read();
  }
}
@Module({})
export class OperationsModule {
  static prepare(
    env: Readonly<Record<string, string | undefined>>,
  ): DynamicModule {
    // Reuse the public transport's prerequisite validation before providers open
    // database or Redis connections. Exactly one status controller is installed.
    PublicStatusModule.prepare(env, () => {
      throw new Error('Unused reader factory');
    });
    const publicMode = env.PUBLIC_MODE === '1';
    return {
      module: OperationsModule,
      controllers: [
        publicMode ? PublicStatusController : OperationsController,
        OperationsAlertsController,
        BrowserErrorsController,
      ],
      providers: [
        OperationsStatus,
        MonitoringAlerts,
        { provide: AlertsReader, useExisting: MonitoringAlerts },
        { provide: OperationsReader, useExisting: OperationsStatus },
        ...(publicMode
          ? [{ provide: PUBLIC_STATUS, useExisting: OperationsStatus }]
          : []),
      ],
      exports: [OperationsStatus],
    };
  }
}
