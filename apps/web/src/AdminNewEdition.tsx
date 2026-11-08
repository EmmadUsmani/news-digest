import { digestPreviewSchema, editionJobIdSchema } from '@digest/contracts';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { z } from 'zod';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
const editionJobStatusSchema = z.object({
  id: editionJobIdSchema,
  state: z.enum([
    'waiting',
    'active',
    'delayed',
    'prioritized',
    'waiting-children',
    'completed',
    'failed',
  ]),
  editionId: z.string().uuid().nullable(),
  progress: z
    .object({
      stage: z.enum(['topics', 'publishing']),
      topics: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          stage: z.enum(['triage', 'editing', 'posts', 'ready']),
        }),
      ),
    })
    .nullable(),
});

export function AdminNewEdition() {
  const [windowChoice, setWindowChoice] = React.useState('24');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [windowError, setWindowError] = React.useState('');
  const [jobId, setJobId] = React.useState<string | null>(() =>
    sessionStorage.getItem('edition-job'),
  );
  const [jobMessage, setJobMessage] = React.useState('');
  const [aiEditing, setAiEditing] = React.useState(false);
  const [paidXSearch, setPaidXSearch] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const working = busy || jobId !== null;
  const [error, setError] = React.useState('');
  const [resultId, setResultId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<
    { id: string; name: string; stage: string }[]
  >([]);
  React.useEffect(() => {
    if (!jobId) return;
    sessionStorage.setItem('edition-job', jobId);
    let cancelled = false;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      sessionStorage.removeItem('edition-job');
      setJobId(null);
    };
    async function poll() {
      try {
        const response = await fetch(
          `/api/admin/digest-previews/jobs/${encodeURIComponent(jobId!)}`,
          {
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(15_000),
            ]),
          },
        );
        if (cancelled) return;
        if (response.status === 404) {
          setJobMessage(
            'This generation job is no longer available. Check saved editions before trying again.',
          );
          finish();
          return;
        }
        if (!response.ok) throw new Error();
        const job = editionJobStatusSchema.parse(await response.json());
        if (job.id !== jobId || (job.state === 'completed' && !job.editionId))
          throw new Error('Invalid generation status');
        if (cancelled) return;
        if (job.state === 'failed') {
          setJobMessage('Edition generation failed. Try again later.');
          finish();
          return;
        }
        if (job.state === 'completed' && job.editionId) {
          setResultId(job.editionId);
          setJobMessage('Edition ready.');
          finish();
          return;
        }
        setProgress(job.progress?.topics ?? []);
        setJobMessage(
          job.state === 'active'
            ? job.progress?.stage === 'publishing'
              ? 'Publishing your edition…'
              : 'Creating your edition. Topic stages update below.'
            : 'Edition queued. Waiting for the worker…',
        );
      } catch {
        if (cancelled) return;
        setJobMessage(
          'Connection interrupted. Retrying generation status; your job continues in the background.',
        );
      }
      if (!cancelled) timer = setTimeout(() => void poll(), 1500);
    }
    void poll();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [jobId]);
  async function generate() {
    if (working) return;
    const end = windowChoice === 'custom' ? new Date(customEnd) : new Date();
    const start =
      windowChoice === 'custom'
        ? new Date(customStart)
        : new Date(end.getTime() - Number(windowChoice) * 3600000);
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start >= end ||
      end.getTime() > Date.now() ||
      end.getTime() - start.getTime() > 31 * 86400000
    ) {
      setWindowError(
        'Choose a start before the end, with no future dates, spanning at most 31 days.',
      );
      return;
    }
    setWindowError('');
    setBusy(true);
    setError('');
    setResultId(null);
    setProgress([]);
    setJobMessage('');
    try {
      const response = await fetch('/api/admin/digest-previews/tests', {
        method: 'POST',
        signal: AbortSignal.timeout(600_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windowStart: start.toISOString(),
          windowEnd: end.toISOString(),
          aiEditing,
          paidXSearch,
        }),
      });
      if (response.status === 503) {
        const body: unknown = await response.json().catch(() => null);
        const message = z.object({ message: z.string() }).safeParse(body);
        if (
          message.success &&
          [
            'Development AI editing is disabled',
            'Development X search is disabled',
          ].includes(message.data.message)
        ) {
          setError(
            `${message.data.message}. Turn that option off or enable it on the server before retrying. No test edition was saved.`,
          );
          return;
        }
      }
      if (!response.ok) throw new Error();
      const edition = digestPreviewSchema.parse(await response.json());
      setResultId(edition.id);
      setJobMessage('Private test edition ready.');
    } catch {
      setError(
        'Could not confirm whether your test edition was saved. Check saved editions before trying again to avoid a duplicate run.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Create an edition"
      className="grid max-w-2xl gap-5 p-0"
    >
      <p className="m-0 text-sm text-[var(--secondary)]">
        Create a private test edition from already collected content. Free by
        default; it stays out of the reader and uses no scheduled edition
        budget.
      </p>
      <Card>
        {' '}
        <form
          className="grid gap-4 [&_fieldset]:grid [&_fieldset]:gap-4 [&_input]:w-full [&_input]:min-w-0 [&_select]:w-full"
          onSubmit={(event) => {
            event.preventDefault();
            void generate();
          }}
        >
          <fieldset disabled={working}>
            <legend>Choose a coverage period</legend>
            <label htmlFor="coverage-period">Period</label>
            <select
              id="coverage-period"
              value={windowChoice}
              onChange={(event) => {
                setWindowChoice(event.target.value);
                setWindowError('');
              }}
            >
              <option value="6">Last 6 hours</option>
              <option value="24">Last 24 hours</option>
              <option value="168">Last 7 days</option>
              <option value="custom">Custom period</option>
            </select>
            {windowChoice === 'custom' && (
              <div className="grid gap-3">
                <p id="window-help">
                  Times use your browser timezone (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}). Start is
                  included; end is excluded. Maximum 31 days.
                </p>
                <label htmlFor="window-start">Start</label>
                <input
                  required
                  id="window-start"
                  type="datetime-local"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  aria-describedby="window-help"
                />
                <label htmlFor="window-end">End</label>
                <input
                  required
                  id="window-end"
                  type="datetime-local"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  aria-describedby="window-help"
                />
              </div>
            )}
            <p className="window-note">
              Uses already collected articles; older coverage may be incomplete.
              Quiet periods stay empty.
            </p>
            <label htmlFor="test-ai-editing">AI editing</label>
            <select
              id="test-ai-editing"
              value={aiEditing ? 'on' : 'off'}
              onChange={(event) => setAiEditing(event.target.value === 'on')}
              aria-describedby="test-ai-help"
            >
              <option value="off">Off · free</option>
              <option value="on">On · development budget</option>
            </select>
            <p id="test-ai-help">
              AI editing uses the limited development allowance and must be
              enabled on the server.
            </p>
            <label htmlFor="test-paid-x">Paid X search</label>
            <select
              id="test-paid-x"
              value={paidXSearch ? 'on' : 'off'}
              onChange={(event) => setPaidXSearch(event.target.value === 'on')}
              aria-describedby="test-paid-x-help"
            >
              <option value="off">Off · reuse stored posts</option>
              <option value="on">On · development budget</option>
            </select>
            <p id="test-paid-x-help">
              Paid X search uses the separate, limited development allowance and
              must be enabled on the server. Off reuses stored posts for free.
            </p>
            <Link to="/admin/spend" className="text-sm underline">
              Review development charges, holds and remaining allowances
            </Link>
            <Button type="submit">
              {working
                ? 'Creating edition…'
                : `Create test edition · ${windowChoice === 'custom' ? 'custom period' : windowChoice === '168' ? 'last 7 days' : `last ${windowChoice} hours`}`}
            </Button>
          </fieldset>
          {windowError && <p role="alert">{windowError}</p>}
        </form>
      </Card>
      {error && <p role="alert">{error}</p>}
      <Card>
        <h2 className="mt-0 font-sans text-lg font-semibold">
          Generation progress
        </h2>
        <p role="status">
          {jobMessage ||
            'Choose a window to start. Keep this page open until the test edition is ready.'}
        </p>
        {!!progress.length && (
          <ul className="grid gap-3 pl-5">
            {progress.map((topic) => (
              <li key={topic.id}>
                <strong>{topic.name}</strong> · {topic.stage}
              </li>
            ))}
          </ul>
        )}
        {resultId && (
          <Button asChild>
            <Link to="/admin/editions/$id" params={{ id: resultId }}>
              Inspect created edition
            </Link>
          </Button>
        )}
      </Card>
      <Link to="/admin/editions" className="text-sm underline">
        Browse saved editions
      </Link>
    </section>
  );
}
