import { ProviderNotDispatched } from '../domain/llm.port';

// Process-local, shared by every Anthropic adapter. A queued reservation must
// not wait indefinitely; expiration never cancels work already dispatched.
export class InferenceSlots {
  private active = 0;
  private readonly waiting: (() => void)[] = [];

  constructor(
    private readonly capacity = 4,
    private readonly queueTimeoutMs = 10000,
    private readonly now = () => performance.now(),
  ) {
    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      !Number.isFinite(queueTimeoutMs) ||
      queueTimeoutMs <= 0
    )
      throw new Error('Invalid inference slot limits');
  }

  async run<T>(work: () => Promise<T>): Promise<T> {
    const end = this.now() + this.queueTimeoutMs;
    if (this.active < this.capacity) this.active++;
    else
      await new Promise<void>((resolve, reject) => {
        const expire = () => {
          const index = this.waiting.indexOf(acquire);
          if (index >= 0) this.waiting.splice(index, 1);
          reject(new ProviderNotDispatched('inference-queue-expired'));
        };
        const timer = setTimeout(expire, this.queueTimeoutMs);
        const acquire = () => {
          clearTimeout(timer);
          resolve();
        };
        this.waiting.push(acquire);
      });
    try {
      // Timers can run late. Check again after transfer before dispatching.
      if (this.now() >= end)
        throw new ProviderNotDispatched('inference-queue-expired');
      return await work();
    } finally {
      const next = this.waiting.shift();
      if (next)
        next(); // Transfer ownership without briefly opening a slot.
      else this.active--;
    }
  }
}
