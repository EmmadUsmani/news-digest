import { incrementalTriagePass } from './incremental-triage-pass';
import type { CandidateTriage, TriageCandidate, TriageTopic } from './triage';

export interface IncrementalTriageAdmission {
  acquire(): Promise<null | (() => Promise<void>)>;
}

// Use one runner instance for all topics. The worker composition supplies
// shared admission to prevent overlapping work across multiple workers.
export class IncrementalTriageRunner {
  private running = false;

  constructor(
    private readonly triage: Pick<CandidateTriage, 'pending' | 'score'>,
    private readonly schedule: () => {
      nextEditionAt: number;
      cutoffMs: number;
    },
    private readonly now: () => number = Date.now,
    private readonly admission?: IncrementalTriageAdmission,
  ) {}

  private beforeCutoff() {
    const { nextEditionAt, cutoffMs } = this.schedule();
    const now = this.now();
    if (
      !Number.isFinite(nextEditionAt) ||
      !Number.isFinite(cutoffMs) ||
      cutoffMs < 0 ||
      !Number.isFinite(now)
    )
      throw new Error('Invalid incremental triage cutoff');
    return now < nextEditionAt - cutoffMs;
  }

  async run(
    load: () => Promise<{
      topic: TriageTopic;
      candidates: TriageCandidate[];
      runId: string;
    }>,
    options: { minimumPending: number; maximumItems: number },
  ) {
    // Skip overlapping ticks rather than queueing stale pools behind long calls.
    if (this.running) return { status: 'busy' as const };
    if (!this.beforeCutoff()) return { status: 'cutoff' as const };
    this.running = true;
    let release: (() => Promise<void>) | null = null;
    let failure: { error: unknown } | undefined;
    try {
      if (this.admission) {
        release = await this.admission.acquire();
        if (!release) return { status: 'busy' as const };
      }
      if (!this.beforeCutoff()) return { status: 'cutoff' as const };
      const { topic, candidates, runId } = await load();
      if (!this.beforeCutoff()) return { status: 'cutoff' as const };
      let cutoff = false;
      const result = await incrementalTriagePass(
        {
          pending: this.triage.pending.bind(this.triage),
          score: (...args) => {
            // Pool/cache reads can cross the boundary or a schedule change.
            // Already-started calls may finish; no new score starts at cutoff.
            if (!this.beforeCutoff()) {
              cutoff = true;
              return Promise.resolve({
                scores: [],
                unscoredIds: args[1].map((candidate) => candidate.id),
              });
            }
            return this.triage.score(...args);
          },
        },
        topic,
        candidates,
        runId,
        options,
      );
      return {
        status: cutoff ? ('cutoff' as const) : ('completed' as const),
        result,
      };
    } catch (error) {
      failure = { error };
      throw error;
    } finally {
      try {
        await release?.();
      } catch (cleanupError) {
        if (failure)
          throw new AggregateError(
            [failure.error, cleanupError],
            'Incremental triage and admission cleanup failed',
          );
        throw cleanupError;
      } finally {
        this.running = false;
      }
    }
  }
}
