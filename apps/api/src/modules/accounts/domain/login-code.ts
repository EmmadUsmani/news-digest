export interface LoginCodeChallenge {
  email: string;
  codeHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export abstract class LoginCodeRepository {
  // Replace the previous challenge for this email and reset its attempt count.
  abstract replace(challenge: LoginCodeChallenge): Promise<void>;
  // Lock the challenge, reject future/expired/consumed rows or five prior
  // attempts, count this attempt, compare, and consume on success atomically.
  // Never pass a stored hash back to application callers.
  abstract consume(
    email: string,
    now: Date,
    matches: (storedHash: string) => boolean,
  ): Promise<boolean>;
}

export abstract class LoginCodeSecrets {
  abstract generate(): string;
  abstract hash(email: string, code: string): string;
  abstract matches(expected: string, actual: string): boolean;
}

export abstract class LoginCodeDelivery {
  abstract deliver(email: string, code: string, expiresAt: Date): Promise<void>;
}

export abstract class LoginCodeAdmission {
  // Apply shared per-email AND per-client limits even for unknown identities.
  abstract allow(email: string, clientAddress: string): Promise<boolean>;
  // Enforce signup mode and existing-account/invitation policy internally.
  abstract eligible(email: string): Promise<boolean>;
}
