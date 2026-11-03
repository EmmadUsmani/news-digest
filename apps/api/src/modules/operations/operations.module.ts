import { Controller, Get, Module } from '@nestjs/common';

import { OperationsStatus } from './adapters/operations.status';
import { OperationsReader } from './domain/operations.reader';
@Controller('api/status')
class OperationsController {
  constructor(private readonly status: OperationsReader) {}
  @Get() read() {
    return this.status.read();
  }
}
@Module({
  controllers: [OperationsController],
  providers: [
    OperationsStatus,
    { provide: OperationsReader, useExisting: OperationsStatus },
  ],
  exports: [OperationsStatus],
})
export class OperationsModule {}
