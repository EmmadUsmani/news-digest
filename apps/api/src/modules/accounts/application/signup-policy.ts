export type SignupMode = 'off' | 'invite' | 'open';

// Prepared only; runtime account registration remains disabled.
export class SignupPolicy {
  readonly mode: SignupMode;

  constructor(
    mode: string,
    delivery: 'stand-in' | 'provider',
    private readonly existingIdentity: (email: string) => Promise<boolean>,
    private readonly adminEmails: ReadonlySet<string>,
  ) {
    if (mode !== 'off' && mode !== 'invite' && mode !== 'open')
      throw new Error('Invalid signup mode');
    if (mode === 'open' && delivery === 'stand-in')
      throw new Error('Open signup requires a real mail provider');
    this.mode = mode;
  }

  async eligible(emailInput: string): Promise<boolean> {
    const email = emailInput.trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return false;
    if (this.mode === 'open') return true;
    try {
      if (await this.existingIdentity(email)) return true;
      // Invite mode bootstraps only configured admins. Friends enter through
      // separately verified, single-use admin-issued links, never a code request.
      return this.mode === 'invite' && this.adminEmails.has(email);
    } catch {
      return false;
    }
  }
}
