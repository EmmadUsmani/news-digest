// Offline observations only; never infer per-topic calls from overlapping timestamps.
import { readFileSync } from 'node:fs';

import { z } from 'zod';

const timestamp = z.number().int().nonnegative().safe();
const eventSchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('edition.start'), time: timestamp }),
  z.object({ event: z.literal('edition.finish'), time: timestamp }),
  z.object({
    event: z.literal('edition.step'),
    time: timestamp,
    topic: z.string().optional(),
    stage: z.enum([
      'topics',
      'publishing',
      'triage',
      'editing',
      'posts',
      'ready',
    ]),
  }),
  z.object({
    event: z.literal('external.call'),
    time: timestamp,
    purpose: z.string().min(1),
    durationMs: timestamp,
    outcome: z.enum(['success', 'error']),
  }),
]);

export function evaluateEditionTimeline(input: unknown) {
  const events = z.array(eventSchema).parse(input);
  const starts = events.filter((event) => event.event === 'edition.start');
  const finishes = events.filter((event) => event.event === 'edition.finish');
  if (starts.length !== 1 || finishes.length !== 1)
    throw new Error('Expected exactly one edition start and finish');
  const start = starts[0].time;
  const finish = finishes[0].time;
  if (finish <= start || events.some((e) => e.time < start || e.time > finish))
    throw new Error('Events outside edition interval');
  const calls = events.filter((event) => event.event === 'external.call');
  const steps = events.filter((event) => event.event === 'edition.step');
  const topics = [...new Set(steps.flatMap((step) => step.topic ?? []))].map(
    (topic) => {
      const times = ['triage', 'editing', 'posts', 'ready'].map((stage) => {
        const matching = steps.filter(
          (s) => s.topic === topic && s.stage === stage,
        );
        if (matching.length !== 1) throw new Error('Incomplete topic stages');
        return matching[0].time;
      });
      if (times.some((time, i) => i > 0 && time < times[i - 1]))
        throw new Error('Topic stages out of order');
      return {
        topic,
        triageMs: times[1] - times[0],
        editingMs: times[2] - times[1],
        postsMs: times[3] - times[2],
        postsStartMs: times[2] - start,
        readyMs: times[3] - start,
      };
    },
  );
  if (topics.length === 0) throw new Error('No topic stages');
  const readiness = topics.map((topic) => topic.readyMs).sort((a, b) => a - b);
  const lastTopicStart = start + (readiness.at(-2) ?? 0);
  function occupancy(from: number, until: number) {
    const boundaries = new Map<number, number>([
      [from, 0],
      [until, 0],
    ]);
    for (const call of calls) {
      const left = Math.max(from, call.time - call.durationMs);
      const right = Math.min(until, call.time);
      if (right <= left) continue;
      boundaries.set(left, (boundaries.get(left) ?? 0) + 1);
      boundaries.set(right, (boundaries.get(right) ?? 0) - 1);
    }
    let active = 0;
    let previous = from;
    const histogram = new Map<number, number>();
    for (const [time, delta] of [...boundaries].sort(([a], [b]) => a - b)) {
      histogram.set(active, (histogram.get(active) ?? 0) + time - previous);
      active += delta;
      previous = time;
    }
    return [...histogram]
      .filter(([, ms]) => ms > 0)
      .map(([calls, ms]) => ({ calls, ms }));
  }
  return {
    elapsedMs: finish - start,
    topics,
    occupancy: occupancy(start, finish),
    lastTopicTail: {
      startMs: lastTopicStart - start,
      elapsedMs: finish - lastTopicStart,
      occupancy: occupancy(lastTopicStart, finish),
      calls: calls
        .filter((call) => call.time > lastTopicStart)
        .map((call) => ({
          purpose: call.purpose,
          startMs: call.time - call.durationMs - start,
          endMs: call.time - start,
          outcome: call.outcome,
        })),
    },
  };
}

if (require.main === module)
  console.log(
    JSON.stringify(
      evaluateEditionTimeline(
        JSON.parse(readFileSync(process.argv[2], 'utf8')),
      ),
    ),
  );
