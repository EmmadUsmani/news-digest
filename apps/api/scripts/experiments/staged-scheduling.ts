// Offline scheduling experiment only. Durations and costs are supplied scenarios,
// never inferred provider traces or production budget decisions.
import { EditorialEnvelopeModel } from './editorial-envelope';

export interface SchedulingJob {
  id: string;
  after: string[];
  durationMs: number;
  reservation: number;
  cost: number;
  fails?: boolean;
  owner?: string;
  releaseOwner?: boolean;
}

export function simulateStagedScheduling(
  jobs: readonly SchedulingJob[],
  budget: number,
  protectedBudget = 0,
  envelopes?: Readonly<Record<string, number>>,
  maxAdmissionWaitMs = 0,
) {
  const ledger = new EditorialEnvelopeModel(budget);
  const opened = new Set<string>();
  const deadlines = new Map<string, number>();
  const rejectedOwners = new Set<string>();
  if (
    envelopes &&
    (protectedBudget !== 0 ||
      Object.entries(envelopes).some(
        ([owner, bound]) => !owner || !Number.isSafeInteger(bound) || bound < 0,
      ))
  )
    throw new Error('Invalid envelope configuration');
  const ids = new Set(jobs.map((job) => job.id));
  if (
    !Number.isSafeInteger(maxAdmissionWaitMs) ||
    maxAdmissionWaitMs < 0 ||
    (maxAdmissionWaitMs > 0 && !envelopes) ||
    ids.size !== jobs.length ||
    !Number.isSafeInteger(budget) ||
    !Number.isSafeInteger(protectedBudget) ||
    protectedBudget < 0 ||
    budget < protectedBudget ||
    jobs.some(
      (job) =>
        !job.id ||
        (envelopes !== undefined &&
          (!job.owner || !Object.hasOwn(envelopes, job.owner))) ||
        (envelopes === undefined &&
          (job.owner !== undefined || job.releaseOwner !== undefined)) ||
        job.after.some((id) => !ids.has(id)) ||
        [job.durationMs, job.reservation, job.cost].some(
          (value) => !Number.isSafeInteger(value) || value < 0,
        ) ||
        job.cost > job.reservation,
    )
  )
    throw new Error('Invalid scheduling scenario');
  // Validate the whole graph before budget refusals or failures can hide a
  // disconnected cycle. Scenario validity must not depend on execution order.
  const dependencies = new Map(jobs.map((job) => [job.id, job.after]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (id: string) => {
    if (visiting.has(id)) throw new Error('Cyclic scheduling dependencies');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of dependencies.get(id)!) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of ids) visit(id);
  const pending = [...jobs];
  const done = new Set<string>();
  const refused = new Set<string>();
  const active: { job: SchedulingJob; finish: number }[] = [];
  const trace: { id: string; time: number; event: string }[] = [];
  let time = 0;
  let spent = 0;
  let held = 0;
  let failed = false;
  while (pending.length || active.length) {
    if (failed) {
      for (const job of pending)
        trace.push({ id: job.id, time, event: 'cancelled' });
      pending.length = 0;
    }
    for (let i = 0; i < pending.length;) {
      const job = pending[i];
      if (job.after.some((id) => refused.has(id))) {
        pending.splice(i, 1);
        refused.add(job.id);
        trace.push({ id: job.id, time, event: 'blocked' });
      } else if (active.length < 4 && job.after.every((id) => done.has(id))) {
        if (
          envelopes &&
          !opened.has(job.owner!) &&
          !rejectedOwners.has(job.owner!)
        ) {
          if (time > (deadlines.get(job.owner!) ?? Infinity))
            rejectedOwners.add(job.owner!);
          else if (ledger.open(job.owner!, 1, envelopes[job.owner!]))
            opened.add(job.owner!);
          else {
            const deadline =
              deadlines.get(job.owner!) ?? time + maxAdmissionWaitMs;
            if (!Number.isSafeInteger(deadline))
              throw new Error('Invalid waiting deadline');
            // Waiting owns no capacity or inference slot. Retry after settlement;
            // at the deadline, a just-settled call may still make admission fit.
            if (maxAdmissionWaitMs > 0 && time < deadline) {
              if (!deadlines.has(job.owner!)) {
                deadlines.set(job.owner!, deadline);
                trace.push({ id: job.id, time, event: 'waiting' });
              }
              i++;
              continue;
            }
            rejectedOwners.add(job.owner!);
          }
        }
        deadlines.delete(job.owner!);
        pending.splice(i, 1);
        if (
          envelopes
            ? rejectedOwners.has(job.owner!)
            : spent + held + job.reservation + protectedBudget > budget
        ) {
          refused.add(job.id);
          trace.push({ id: job.id, time, event: 'refused' });
        } else {
          if (envelopes)
            ledger.transfer(job.owner!, 1, job.id, job.reservation);
          held += job.reservation;
          active.push({ job, finish: time + job.durationMs });
          trace.push({ id: job.id, time, event: 'start' });
        }
      } else i++;
    }
    if (!active.length) {
      // No dispatched work can free capacity: do not burn the waiting bound.
      const waiting = pending.filter((job) => deadlines.has(job.owner!));
      if (waiting.length) {
        for (const job of waiting) {
          rejectedOwners.add(job.owner!);
          deadlines.delete(job.owner!);
        }
        continue;
      }
      // A dependent may precede its refused prerequisite in input order.
      if (pending.some((job) => job.after.some((id) => refused.has(id))))
        continue;
      if (pending.length) throw new Error('Cyclic scheduling dependencies');
      break;
    }
    time = Math.min(
      ...active.map((item) => item.finish),
      ...[...deadlines.values()].filter((deadline) => deadline > time),
    );
    for (let i = 0; i < active.length;) {
      const item = active[i];
      if (item.finish === time) {
        active.splice(i, 1);
        held -= item.job.reservation;
        spent += item.job.cost;
        if (envelopes) {
          ledger.settle(item.job.id, item.job.cost);
          if (item.job.releaseOwner) ledger.close(item.job.owner!, 1);
        }
        if (item.job.fails) {
          failed = true;
          trace.push({ id: item.job.id, time, event: 'failed' });
        } else {
          done.add(item.job.id);
          trace.push({ id: item.job.id, time, event: 'settle' });
        }
      } else i++;
    }
  }
  // Drain every dispatched call before fencing/releasing unused ownership.
  // This models definite settlements only; uncertain calls belong in recovery tests.
  if (envelopes)
    for (const owner of opened) {
      ledger.fence(owner, 1);
      ledger.recover(owner, 1, 2);
    }
  const accounting = envelopes ? ledger.snapshot() : undefined;
  return {
    accounting,
    elapsedMs: time,
    spent,
    held,
    protectedBudget,
    failed,
    trace,
  };
}
