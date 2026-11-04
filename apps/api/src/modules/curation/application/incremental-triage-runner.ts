import { incrementalTriagePass } from './incremental-triage-pass';
import type { CandidateTriage, TriageCandidate, TriageTopic } from './triage';

// Prepared worker-local admission only; no timer invokes this runner yet.
// Use one instance for all topics. This is not a distributed scheduler lock.
export class IncrementalTriageRunner {
  private running = false;

  constructor(
    private readonly triage: Pick<CandidateTriage, 'pending' | 'score'>,
    private readonly schedule: () => {
      nextEditionAt: number;
      cutoffMs: number;
    },
    private readonly now: () => number = Date.now,
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
    try {
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
    } finally {
      this.running = false;
    }
  }
}
