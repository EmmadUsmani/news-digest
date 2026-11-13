// Offline scheduling experiment only. Durations and costs are supplied scenarios,
// never inferred provider traces or production budget decisions.
export interface SchedulingJob {
  id: string;
  after: string[];
  durationMs: number;
  reservation: number;
  cost: number;
}

export function simulateStagedScheduling(
  jobs: readonly SchedulingJob[],
  budget: number,
  protectedBudget = 0,
) {
  const ids = new Set(jobs.map((job) => job.id));
  if (
    ids.size !== jobs.length ||
    !Number.isSafeInteger(budget) ||
    !Number.isSafeInteger(protectedBudget) ||
    protectedBudget < 0 ||
    budget < protectedBudget ||
    jobs.some(
      (job) =>
        !job.id ||
        job.after.some((id) => !ids.has(id)) ||
        [job.durationMs, job.reservation, job.cost].some(
          (value) => !Number.isSafeInteger(value) || value < 0,
        ) ||
        job.cost > job.reservation,
    )
  )
    throw new Error('Invalid scheduling scenario');
  const pending = [...jobs];
  const done = new Set<string>();
  const refused = new Set<string>();
  const active: { job: SchedulingJob; finish: number }[] = [];
  const trace: { id: string; time: number; event: string }[] = [];
  let time = 0;
  let spent = 0;
  let held = 0;
  while (pending.length || active.length) {
    for (let i = 0; i < pending.length;) {
      const job = pending[i];
      if (job.after.some((id) => refused.has(id))) {
        pending.splice(i, 1);
        refused.add(job.id);
        trace.push({ id: job.id, time, event: 'blocked' });
      } else if (active.length < 4 && job.after.every((id) => done.has(id))) {
        pending.splice(i, 1);
        if (spent + held + job.reservation + protectedBudget > budget) {
          refused.add(job.id);
          trace.push({ id: job.id, time, event: 'refused' });
        } else {
          held += job.reservation;
          active.push({ job, finish: time + job.durationMs });
          trace.push({ id: job.id, time, event: 'start' });
        }
      } else i++;
    }
    if (!active.length) {
      // A dependent may precede its refused prerequisite in input order.
      if (pending.some((job) => job.after.some((id) => refused.has(id))))
        continue;
      if (pending.length) throw new Error('Cyclic scheduling dependencies');
      break;
    }
    time = Math.min(...active.map((item) => item.finish));
    for (let i = 0; i < active.length;) {
      const item = active[i];
      if (item.finish === time) {
        active.splice(i, 1);
        held -= item.job.reservation;
        spent += item.job.cost;
        done.add(item.job.id);
        trace.push({ id: item.job.id, time, event: 'settle' });
      } else i++;
    }
  }
  return { elapsedMs: time, spent, held, protectedBudget, trace };
}
