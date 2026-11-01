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
  providers: [{ provide: OperationsReader, useClass: OperationsStatus }],
})
export class OperationsModule {}
