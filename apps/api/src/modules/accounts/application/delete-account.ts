import type { AccountDeletionRepository } from '../domain/account-deletion';
import type { SessionTokens } from '../domain/session';

export class DeleteAccount {
  constructor(
    private readonly repository: AccountDeletionRepository,
    private readonly tokens: SessionTokens,
  ) {}

  async execute(token: string): Promise<boolean> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
    return this.repository.deleteForSession(this.tokens.hash(token));
  }
}
