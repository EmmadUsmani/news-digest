import { Controller, Get, Module } from '@nestjs/common';
import { OperationsReader } from './domain/operations.reader';
import { OperationsStatus } from './adapters/operations.status';
@Controller('api/status')
class OperationsController {
 constructor(private readonly status: OperationsReader) {}
 @Get() read() { return this.status.read(); }
}
@Module({ controllers: [OperationsController], providers: [{ provide: OperationsReader, useClass: OperationsStatus }] })
export class OperationsModule {}
