import { useEffect, useRef, useState } from 'react';

import { AdminSessionRevocation } from './AdminSessionRevocation';
import { AdminSignInLink } from './AdminSignInLink';
import { Button } from './components/ui/button';
import { Sheet } from './components/ui/sheet';
import { readerAccountStatus } from './reader-account-status';
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
  const confirmationInput = useRef<HTMLInputElement>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const wasDeleting = useRef(false);
  useEffect(() => {
    if (deleting) confirmationInput.current?.focus();
    else if (wasDeleting.current) deleteButton.current?.focus();
    wasDeleting.current = deleting;
  }, [deleting]);
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
      onOpenChange={(open) => {
        if (!open) {
          setDeleting(false);
          setConfirmation('');
        }
      }}
      trigger={
        <Button className="min-h-11 min-w-11" variant="ghost">
          Account
        </Button>
      }
    >
      <div className="space-y-4 py-4">
        <p role="status" className="text-sm text-[var(--secondary)]">
          {readerAccountStatus(account)}
        </p>
        {account.status === 'failed' && (
          <Button
            className="min-h-11 min-w-11"
            onClick={() => run(account.refresh)}
          >
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
              account.status !== 'failed' && (
                <>
                  <AdminSignInLink />
                  <AdminSessionRevocation onRevoked={account.refresh} />
                </>
              )}
            {account.sync === 'failed' && account.status !== 'failed' && (
              <Button
                className="min-h-11 min-w-11"
                disabled={busy}
                onClick={() => run(account.retrySync)}
              >
                Retry sync
              </Button>
            )}
            <p className="text-sm text-[var(--secondary)]">
              Signing out clears this browser’s synced topics and saved items.
            </p>
            <Button
              className="min-h-11 min-w-11"
              disabled={busy}
              onClick={() => run(() => account.signOut())}
            >
              Sign out
            </Button>
            <Button
              className="min-h-11 min-w-11"
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
                  ref={confirmationInput}
                  id="delete-account-confirmation"
                  className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  disabled={busy}
                  autoComplete="off"
                />
                <Button
                  className="min-h-11 min-w-11"
                  type="submit"
                  disabled={busy || confirmation !== 'DELETE'}
                >
                  Permanently delete account
                </Button>
                <Button
                  className="min-h-11 min-w-11"
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
                className="min-h-11 min-w-11"
                variant="ghost"
                disabled={busy}
                ref={deleteButton}
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
