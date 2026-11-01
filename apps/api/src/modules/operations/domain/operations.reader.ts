import type { OperationsStatus } from '@digest/contracts';
export abstract class OperationsReader {
 abstract read(): Promise<OperationsStatus>;
}
