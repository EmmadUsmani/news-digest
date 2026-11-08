export abstract class AccountDeletionRepository {
  // Resolve ownership from the current session inside the same transaction.
  // Remove the identity, all sessions, pending proofs and personal audit rows.
  // Return false for a missing/revoked session; never accept a caller user ID.
  abstract deleteForSession(tokenHash: string): Promise<boolean>;
}
