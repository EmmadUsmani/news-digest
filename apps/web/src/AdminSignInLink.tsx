import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';

export function AdminSignInLink() {
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'failed'>('idle');
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  return (
    <form
      className="space-y-3 border-b border-[var(--border)] pb-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending.current) return;
        const controller = new AbortController();
        pending.current = controller;
        setLink('');
        setStatus('busy');
        void (async () => {
          try {
            const response = await fetch('/api/account/links', {
              method: 'POST',
              credentials: 'same-origin',
              cache: 'no-store',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
              signal: controller.signal,
            });
            if (response.status !== 201) throw new Error('Refused');
            const result: unknown = await response.json();
            const value = (result as { url?: unknown } | null)?.url;
            if (typeof value !== 'string') throw new Error('Invalid response');
            const url = new URL(value);
            if (
              url.origin !== window.location.origin ||
              url.username ||
              url.password ||
              url.pathname !== '/account/sign-in' ||
              url.search ||
              !/^#[A-Za-z0-9_-]{43}$/.test(url.hash)
            )
              throw new Error('Invalid link');
            if (!controller.signal.aborted) {
              setLink(url.href);
              setEmail('');
              setStatus('idle');
            }
          } catch {
            if (!controller.signal.aborted) setStatus('failed');
          } finally {
            if (pending.current === controller) pending.current = null;
          }
        })();
      }}
    >
      <p className="text-sm font-medium">Invite a reader</p>
      <label className="block text-sm" htmlFor="invite-email">
        Reader email
      </label>
      <input
        id="invite-email"
        type="email"
        required
        maxLength={254}
        autoComplete="off"
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3"
        value={email}
        disabled={status === 'busy'}
        onChange={(event) => {
          setEmail(event.target.value);
          setLink('');
        }}
      />
      <Button type="submit" disabled={status === 'busy'}>
        {status === 'busy' ? 'Creating link…' : 'Create sign-in link'}
      </Button>
      {status === 'failed' && (
        <p role="alert" className="text-sm">
          Could not create a link. Check your admin sign-in and try again.
        </p>
      )}
      {link && (
        <div className="space-y-2">
          <label className="block text-sm" htmlFor="invite-link">
            One-time sign-in link
          </label>
          <textarea
            id="invite-link"
            readOnly
            value={link}
            className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-sm"
            onFocus={(event) => event.target.select()}
          />
          <p className="text-sm">
            Share privately with this reader. Valid for 24 hours and one
            sign-in.
          </p>
          <Button type="button" variant="ghost" onClick={() => setLink('')}>
            Dismiss link
          </Button>
        </div>
      )}
    </form>
  );
}
