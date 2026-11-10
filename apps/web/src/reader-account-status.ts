import type { ReaderAccountState } from './reader-account-binding';

export function readerAccountStatus(account: ReaderAccountState): string {
  return account.status === 'deleting'
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
            : 'Sign in to sync your topics and saved items across devices.';
}
