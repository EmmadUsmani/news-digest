import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';

export function AdminSessionRevocation({
  onRevoked,
}: {
  onRevoked: () => Promise<void>;
}) {
  const [target, setTarget] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'busy' | 'failed' | 'done'>(
    'idle',
  );
  const [count, setCount] = useState(0);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  return (
    <form
      className="space-y-3 border-b border-[var(--border)] pb-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!confirmed || pending.current) return;
        const controller = new AbortController();
        pending.current = controller;
        setStatus('busy');
        void (async () => {
          try {
            const response = await fetch('/api/account/sessions/revoke', {
              method: 'POST',
              credentials: 'same-origin',
              cache: 'no-store',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: target }),
              signal: controller.signal,
            });
            if (response.status !== 200) throw new Error('Refused');
            const result: unknown = await response.json();
            const revoked = (result as { revoked?: unknown } | null)?.revoked;
            if (
              typeof revoked !== 'number' ||
              !Number.isSafeInteger(revoked) ||
              revoked < 0
            )
              throw new Error('Invalid response');
            if (!controller.signal.aborted) {
              setCount(revoked);
              setStatus('done');
              setConfirmed(false);
              setTarget('');
              void onRevoked().catch(() => undefined);
            }
          } catch {
            if (!controller.signal.aborted) setStatus('failed');
          } finally {
            if (pending.current === controller) pending.current = null;
          }
        })();
      }}
    >
      <p className="text-sm font-medium">Sign out a reader’s devices</p>
      <label className="block text-sm" htmlFor="revoke-reader">
        Reader account ID
      </label>
      <input
        id="revoke-reader"
        required
        pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
        maxLength={36}
        autoComplete="off"
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3"
        value={target}
        disabled={status === 'busy'}
        onChange={(event) => {
          setTarget(event.target.value);
          setConfirmed(false);
          setStatus('idle');
        }}
      />
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={status === 'busy'}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        Sign out all devices for this account
      </label>
      <p className="text-sm">
        The reader keeps their account and saved items. Choosing your own
        account also signs you out.
      </p>
      <Button type="submit" disabled={!confirmed || status === 'busy'}>
        {status === 'busy' ? 'Signing out reader…' : 'Confirm reader sign-out'}
      </Button>
      {status === 'failed' && (
        <p role="alert" className="text-sm">
          Could not sign out this reader. Check the account ID and your admin
          sign-in, then try again.
        </p>
      )}
      {status === 'done' && (
        <p role="status" className="text-sm">
          Reader sign-out complete. Sessions removed: {count}.
        </p>
      )}
    </form>
  );
}
