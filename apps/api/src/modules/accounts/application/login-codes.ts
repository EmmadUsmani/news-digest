import type {
  LoginCodeAdmission,
  LoginCodeDelivery,
  LoginCodeRepository,
  LoginCodeSecrets,
} from '../domain/login-code';

const TEN_MINUTES_MS = 600_000;

export class LoginCodes {
  constructor(
    private readonly repository: LoginCodeRepository,
    private readonly secrets: LoginCodeSecrets,
    private readonly delivery: LoginCodeDelivery,
    private readonly admission: LoginCodeAdmission,
  ) {}

  async request(emailInput: string, clientAddress: string, now: Date) {
    const email = normalizeEmail(emailInput);
    if (email && (await this.admission.allow(email, clientAddress))) {
      if (await this.admission.eligible(email)) {
        const code = this.secrets.generate();
        const expiresAt = new Date(now.getTime() + TEN_MINUTES_MS);
        await this.repository.replace({
          email,
          codeHash: this.secrets.hash(email, code),
          createdAt: now,
          expiresAt,
        });
        await this.delivery.deliver(email, code, expiresAt);
      }
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
    const email = normalizeEmail(emailInput);
    if (!email || !(await this.admission.allow(email, clientAddress)))
      return null;
    if (!(await this.admission.eligible(email))) return null;
    // Malformed submissions still consume an attempt on an existing challenge.
    const candidate = /^\d{6}$/.test(code)
      ? this.secrets.hash(email, code)
      : null;
    const consumed = await this.repository.consume(email, now, (stored) =>
      candidate === null ? false : this.secrets.matches(stored, candidate),
    );
    return consumed ? email : null;
  }
}

function normalizeEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}
