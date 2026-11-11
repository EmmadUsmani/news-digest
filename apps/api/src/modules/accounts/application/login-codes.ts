import type {
  LoginCodeAdmission,
  LoginCodeDelivery,
  LoginCodeRepository,
  LoginCodeSecrets,
} from '../domain/login-code';
import type { RecipientCoordination } from '../domain/recipient-coordination';

const TEN_MINUTES_MS = 600_000;

export class LoginCodes {
  constructor(
    private readonly repository: LoginCodeRepository,
    private readonly secrets: LoginCodeSecrets,
    private readonly delivery: LoginCodeDelivery,
    private readonly admission: LoginCodeAdmission,
    private readonly recipients: RecipientCoordination,
  ) {}

  async request(emailInput: string, clientAddress: string, now: Date) {
    const email = normalizeEmail(emailInput);
    if (email && (await this.admission.allow(email, clientAddress))) {
      await this.recipients.run(email, async () => {
        // Eligibility may change while another process holds this recipient.
        if (!(await this.admission.eligible(email))) return;
        const code = this.secrets.generate();
        const expiresAt = new Date(now.getTime() + TEN_MINUTES_MS);
        await this.repository.replace({
          email,
          clientKey: this.secrets.hash(email, `client:${clientAddress}`),
          codeHash: this.secrets.hash(email, code),
          createdAt: now,
          expiresAt,
        });
        await this.delivery.deliver(email, code, expiresAt);
      });
    }
    // Same response for ineligible, throttled and eligible identities.
    return { accepted: true as const };
  }

  async redeem(
    emailInput: string,
    code: string,
    clientAddress: string,
    now: Date,
  ): Promise<string | null> {
    return this.redeemAndThen(emailInput, code, clientAddress, now, (email) =>
      Promise.resolve(email),
    );
  }

  // Admission precedes recipient coordination; completion stays under the lock
  // so deletion cannot interleave between consuming proof and issuing a session.
  async redeemAndThen<T>(
    emailInput: string,
    code: string,
    clientAddress: string,
    now: Date,
    complete: (email: string) => Promise<T>,
  ): Promise<T | null> {
    const email = normalizeEmail(emailInput);
    if (!email || !(await this.admission.allow(email, clientAddress)))
      return null;
    return this.recipients.run(email, async () => {
      if (!(await this.admission.eligible(email))) return null;
      // Malformed submissions still consume an attempt on an existing challenge.
      const candidate = /^\d{6}$/.test(code)
        ? this.secrets.hash(email, code)
        : null;
      const consumed = await this.repository.consume(
        email,
        now,
        (stored) =>
          candidate === null ? false : this.secrets.matches(stored, candidate),
        this.secrets.hash(email, `client:${clientAddress}`),
      );
      return consumed ? complete(email) : null;
    });
  }
}

export function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}
