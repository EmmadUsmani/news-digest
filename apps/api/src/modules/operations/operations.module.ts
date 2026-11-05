import { Controller, Get, Module } from '@nestjs/common';

import { BrowserErrorsController } from './adapters/browser-errors';
import { OperationsStatus } from './adapters/operations.status';
import { OperationsReader } from './domain/operations.reader';
@Controller('api/admin/status')
class OperationsController {
  constructor(private readonly status: OperationsReader) {}
  @Get() read() {
    return this.status.read();
  }
}
@Module({
  controllers: [OperationsController, BrowserErrorsController],
  providers: [
    OperationsStatus,
    { provide: OperationsReader, useExisting: OperationsStatus },
  ],
  exports: [OperationsStatus],
})
export class OperationsModule {}
