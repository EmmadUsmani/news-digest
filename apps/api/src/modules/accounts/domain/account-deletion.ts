export abstract class AccountDeletionRepository {
  // Resolve ownership from the current session inside the same transaction.
  // Remove the identity, all sessions, pending proofs and personal settings; retain admin history.
  // Return false for a missing/revoked session; never accept a caller user ID.
  abstract deleteForSession(tokenHash: string): Promise<boolean>;
}

// External personal data must be removed before committing identity deletion.
// Implementations must be idempotent: a later database failure can require retry.
export abstract class AccountDeletionCleanup {
  abstract remove(email: string): Promise<void>;
}
