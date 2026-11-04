import type { IncrementalTriageRunner } from './incremental-triage-runner';

type Runner = Pick<IncrementalTriageRunner, 'run'>;
type Load = Parameters<Runner['run']>[0];
type Options = Parameters<Runner['run']>[1];

// Tick orchestration for the default-off incremental-triage timer.
// One topic per tick bounds total work, rather than multiplying the per-pass
// item limit by topic count. Rotate even after failure to avoid starvation.
export class IncrementalTriageScheduler {
  private running = false;
  private lastTopicId: string | undefined;

  constructor(
    private readonly runner: Runner,
    private readonly options: Options,
  ) {}

  async tick(topics: { id: string; load: Load }[]) {
    if (this.running) return { status: 'busy' as const };
    if (
      topics.some((topic) => !topic.id.trim()) ||
      new Set(topics.map((topic) => topic.id)).size !== topics.length
    )
      throw new Error('Expected unique nonempty topic IDs');
    if (!topics.length) return { status: 'empty' as const };
    const previous = topics.findIndex((topic) => topic.id === this.lastTopicId);
    const topic = topics[(previous + 1) % topics.length];
    this.running = true;
    try {
      const result = await this.runner.run(async () => {
        const input = await topic.load();
        if (input.topic.id !== topic.id)
          throw new Error('Incremental triage topic identity changed');
        return input;
      }, this.options);
      // Contention and cutoff do not consume a topic's turn.
      if (result.status === 'completed') this.lastTopicId = topic.id;
      return { topicId: topic.id, ...result };
    } catch (error) {
      this.lastTopicId = topic.id;
      throw error;
    } finally {
      this.running = false;
    }
  }
}
