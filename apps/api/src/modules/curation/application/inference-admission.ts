// Process-wide admission precedes budget holds, across topics and adapter instances.
// Retain ownership through validation/repair so repairs cannot queue behind peers.
export class InferenceAdmission {
  private active = 0;
  private readonly waiting: (() => void)[] = [];

  constructor(
    private readonly capacity = 4,
    private readonly maximumWaiting = 64,
    private readonly timeoutMs = 200000,
    private readonly now = () => performance.now(),
  ) {
    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Number.isInteger(maximumWaiting) ||
      maximumWaiting < 0 ||
      !Number.isFinite(timeoutMs) ||
      timeoutMs <= 0
    )
      throw new Error('Invalid inference admission limits');
  }

  async run<T>(
    work: () => Promise<T>,
    remainingMs = this.timeoutMs,
  ): Promise<T | undefined> {
    if (!Number.isFinite(remainingMs) || remainingMs <= 0) return undefined;
    const allowance = Math.min(this.timeoutMs, remainingMs);
    const end = this.now() + allowance;
    if (this.active < this.capacity) this.active++;
    else {
      if (this.waiting.length >= this.maximumWaiting) return undefined;
      const acquired = await new Promise<boolean>((resolve) => {
        const acquire = () => {
          clearTimeout(timer);
          resolve(true);
        };
        const timer = setTimeout(() => {
          const index = this.waiting.indexOf(acquire);
          if (index >= 0) this.waiting.splice(index, 1);
          resolve(false);
        }, allowance);
        this.waiting.push(acquire);
      });
      if (!acquired) return undefined;
    }
    try {
      if (this.now() >= end) return undefined;
      return await work();
    } finally {
      const next = this.waiting.shift();
      if (next) next();
      else this.active--;
    }
  }
}

export const inferenceAdmission = new InferenceAdmission();
