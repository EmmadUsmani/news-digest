// Prepared lifecycle only: the production worker does not import this module.
// Await shutdown before closing the database used by an in-flight tick.
export function prepareIncrementalTriageTimer(deps: {
  tick(): Promise<unknown>;
  onError(error: unknown): void;
  everyMs: number;
}) {
  if (
    !Number.isSafeInteger(deps.everyMs) ||
    deps.everyMs < 1 ||
    deps.everyMs > 2_147_483_647
  )
    throw new Error('Invalid incremental triage timer interval');
  let stopped = false;
  let pending: Promise<void> | undefined;
  const run = () => {
    if (stopped || pending) return;
    pending = Promise.resolve()
      .then(() => deps.tick())
      .then(() => undefined)
      .catch((error: unknown) => {
        deps.onError(error);
      })
      .finally(() => {
        pending = undefined;
      });
    // An error reporter must not turn a background failure into an unhandled
    // rejection. Shutdown still observes the failure through the original task.
    void pending.catch(() => undefined);
  };
  const timer = setInterval(run, deps.everyMs);
  timer.unref();
  return async () => {
    stopped = true;
    clearInterval(timer);
    await pending;
  };
}
