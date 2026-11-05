export abstract class EditionJobRequests {
  abstract record(id: string): Promise<void>;
  abstract exists(id: string): Promise<boolean>;
}
