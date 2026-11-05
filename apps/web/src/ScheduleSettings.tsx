import { type ProfileSettings, profileSettingsSchema } from '@digest/contracts';
import React from 'react';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
export function ScheduleSettings({
  profile,
  onSaved,
}: {
  profile: ProfileSettings;
  onSaved: (profile: ProfileSettings) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const saveButton = React.useRef<HTMLButtonElement>(null);
  const restoreSaveFocus = React.useRef(false);
  React.useEffect(() => {
    if (busy || !restoreSaveFocus.current) return;
    saveButton.current?.focus();
    restoreSaveFocus.current = false;
  }, [busy]);
  const schedule = profile.schedule;
  const [minute, hour] = schedule.cadence.split(' ');
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const [hours, minutes] = String(data.get('time')).split(':');
    const input = {
      cadence: `${Number(minutes)} ${Number(hours)} * * *`,
      timezone: String(data.get('timezone')).trim(),
      coverageWindow: String(data.get('coverageWindow')).trim(),
      storyBudget: Number(data.get('storyBudget')),
      postBudget: Number(data.get('postBudget')),
    };
    restoreSaveFocus.current = true;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/profile/schedule', {
        method: 'PUT',
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error: unknown = await response.json().catch(() => null);
        setMessage(
          error !== null &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Schedule request failed. Your changes are still here; reload to check the saved schedule before trying again.',
        );
        return;
      }
      onSaved(profileSettingsSchema.parse(await response.json()));
      setMessage(
        'Schedule settings saved. Automatic editions follow this schedule; changes take effect within 10 seconds.',
      );
    } catch {
      setMessage(
        'Could not confirm whether schedule settings were saved. Your changes are still here; reload to check the saved schedule before trying again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="max-w-3xl [&_input]:mt-2 [&_input]:block [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-[var(--border)] [&_input]:bg-[var(--surface)] [&_input]:px-3 [&_input]:py-2 [&_label]:block [&_label]:text-sm [&_label]:font-medium [&_p]:text-sm [&_p]:text-[var(--secondary)]">
      <p className="schedule-note">
        Automatic edition: daily at {hour.padStart(2, '0')}:
        {minute.padStart(2, '0')} ({schedule.timezone.replaceAll('_', ' ')}) ·
        Coverage: {schedule.coverageWindow}. Automatic editions follow this
        schedule; changes take effect within 10 seconds.
      </p>
      <form
        key={JSON.stringify(schedule)}
        aria-label="Schedule settings"
        onSubmit={save}
      >
        <fieldset
          disabled={busy}
          className="m-0 grid min-w-0 gap-5 border-0 p-0"
        >
          <legend className="mb-5 font-semibold">Schedule your edition</legend>
          <label>
            Daily local time
            <input
              name="time"
              type="time"
              required
              defaultValue={`${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`}
            />
          </label>
          <label>
            IANA timezone
            <input
              name="timezone"
              required
              maxLength={100}
              defaultValue={schedule.timezone}
              list="timezones"
            />
          </label>
          <datalist id="timezones">
            {[
              'America/Los_Angeles',
              'America/New_York',
              'Europe/London',
              'Europe/Paris',
              'Asia/Tokyo',
              'UTC',
            ].map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>
          <p>
            The time is local to this timezone, including daylight saving
            changes. Daily cadence is currently supported.
          </p>
          <label>
            Coverage window
            <input
              name="coverageWindow"
              required
              maxLength={100}
              defaultValue={schedule.coverageWindow}
            />
          </label>
          <p>
            Use an elapsed ISO duration, such as PT6H, P1D or P7D (maximum 31
            days). P1D always means 24 hours, including daylight saving days.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              Default story budget
              <input
                name="storyBudget"
                type="number"
                min="0"
                max="20"
                required
                defaultValue={schedule.storyBudget}
              />
            </label>
            <label>
              Default post budget
              <input
                name="postBudget"
                type="number"
                min="0"
                max="20"
                required
                defaultValue={schedule.postBudget}
              />
            </label>
          </div>
          <p>
            Defaults prefill new topics. Existing topics keep their own budgets.
            Post budgets limit verified posts in new editions. Saved editions
            keep their original windows and selections.
          </p>
          <Button ref={saveButton} type="submit" className="justify-self-start">
            {busy ? 'Saving…' : 'Save schedule'}
          </Button>
        </fieldset>
        <p role="status">{message}</p>
      </form>
    </Card>
  );
}
