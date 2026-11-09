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
  if (!enabled) return null;
  const busy =
    account.status === 'checking' || account.status === 'signing-out';
  const run = (action: () => Promise<void>) =>
    void action().catch(() => undefined);
  return (
    <Sheet
      title="Your account"
      trigger={<Button variant="ghost">Account</Button>}
    >
      <div className="space-y-4 py-4">
        <p role="status" className="text-sm text-[var(--secondary)]">
          {account.status === 'signing-out'
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
          </>
        )}
      </div>
    </Sheet>
  );
}
