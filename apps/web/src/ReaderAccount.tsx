import { useState } from 'react';

import { AdminSignInLink } from './AdminSignInLink';
import { Button } from './components/ui/button';
import { Sheet } from './components/ui/sheet';
import type { useReaderAccount } from './use-reader-account';

// Prepared for the reader header; mount only behind the account feature gate.
export function ReaderAccount({
  enabled,
  account,
}: {
  enabled: boolean;
  account: ReturnType<typeof useReaderAccount>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  if (!enabled) return null;
  const busy =
    account.status === 'checking' ||
    account.status === 'signing-out' ||
    account.status === 'deleting';
  const run = (action: () => Promise<void>) =>
    void action().catch(() => undefined);
  return (
    <Sheet
      title="Your account"
      trigger={<Button variant="ghost">Account</Button>}
    >
      <div className="space-y-4 py-4">
        <p role="status" className="text-sm text-[var(--secondary)]">
          {account.status === 'deleting'
            ? 'Deleting account…'
            : account.status === 'signing-out'
              ? 'Signing out…'
              : account.status === 'checking'
                ? 'Checking sign-in…'
                : account.status === 'failed'
                  ? 'Could not update your sign-in. Your choices are kept here and syncing is paused.'
                  : account.session?.signedIn
                    ? account.sync === 'failed'
                      ? 'Could not sync. Your choices are kept here. Try again.'
                      : account.sync === 'syncing'
                        ? 'Syncing your topics and saved items…'
                        : account.sync === 'idle'
                          ? 'Your topics and saved items are synced.'
                          : 'Syncing is paused.'
                    : 'Sign in to sync your topics and saved items across devices.'}
        </p>
        {account.status === 'failed' && (
          <Button onClick={() => run(account.refresh)}>
            Retry sign-in check
          </Button>
        )}
        {account.status !== 'failed' && !busy && !account.session?.signedIn && (
          <a
            href="/account/login"
            className="inline-flex min-h-11 items-center underline"
          >
            Sign in
          </a>
        )}
        {account.session?.signedIn && (
          <>
            {account.session.isAdmin &&
              !busy &&
              account.status !== 'failed' && <AdminSignInLink />}
            {account.sync === 'failed' && account.status !== 'failed' && (
              <Button disabled={busy} onClick={() => run(account.retrySync)}>
                Retry sync
              </Button>
            )}
            <p className="text-sm text-[var(--secondary)]">
              Signing out clears this browser’s synced topics and saved items.
            </p>
            <Button
              disabled={busy}
              onClick={() => run(() => account.signOut())}
            >
              Sign out
            </Button>
            <Button
              disabled={busy}
              variant="ghost"
              onClick={() => run(() => account.signOut(true))}
            >
              Sign out all devices
            </Button>
            {deleting ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (confirmation !== 'DELETE' || busy) return;
                  run(async () => {
                    await account.deleteAccount();
                    setDeleting(false);
                    setConfirmation('');
                  });
                }}
              >
                <p className="text-sm">
                  Permanently delete your account and synced topics and saved
                  items. This signs out all devices and clears this browser’s
                  choices.
                </p>
                <label
                  className="block text-sm"
                  htmlFor="delete-account-confirmation"
                >
                  Type DELETE to confirm
                </label>
                <input
                  id="delete-account-confirmation"
                  className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={busy || confirmation !== 'DELETE'}
                >
                  Permanently delete account
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setDeleting(false);
                    setConfirmation('');
                  }}
                >
                  Cancel deletion
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setDeleting(true)}
              >
                Delete account
              </Button>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
