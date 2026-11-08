export abstract class ReaderIdentityRepository {
  // Called only after proof of email ownership. Concurrent first logins must
  // resolve to the same identity without replacing its creation timestamp.
  abstract findOrCreateVerified(email: string, now: Date): Promise<string>;
}
