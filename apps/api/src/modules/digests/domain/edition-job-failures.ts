export abstract class EditionJobFailures {
  abstract record(id: string, durationMs: number): Promise<void>;
  abstract find(id: string): Promise<{ durationMs: number } | null>;
}
