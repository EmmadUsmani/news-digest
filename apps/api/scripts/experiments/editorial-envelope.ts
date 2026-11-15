// Offline integer-unit model only: no database, provider or scheduler wiring.
// Each synchronous operation models one future ledger transaction.
export class EditorialEnvelopeModel {
  private readonly envelopes = new Map<
    string,
    { attempt: number; balance: number; fenced: boolean }
  >();
  private readonly calls = new Map<
    string,
    { owner: string; attempt: number; estimate: number; charge?: number }
  >();
  private peak = 0;

  constructor(private readonly cap: number) {
    this.amount(cap);
  }

  snapshot() {
    let spent = 0;
    let held = 0;
    let owned = 0;
    for (const call of this.calls.values()) {
      if (call.charge === undefined) held += call.estimate;
      else spent += call.charge;
    }
    for (const envelope of this.envelopes.values()) owned += envelope.balance;
    const total = spent + held + owned;
    this.peak = Math.max(this.peak, total);
    return { spent, held, owned, total, peak: this.peak };
  }

  open(owner: string, attempt: number, bound: number): boolean {
    this.amount(bound);
    if (!owner || !Number.isSafeInteger(attempt) || attempt < 1)
      throw new Error('Invalid owner or attempt');
    const existing = this.envelopes.get(owner);
    if (existing) throw new Error('Owner already opened; recover explicitly');
    if (this.snapshot().total + bound > this.cap) return false;
    this.envelopes.set(owner, { attempt, balance: bound, fenced: false });
    this.snapshot();
    return true;
  }

  transfer(owner: string, attempt: number, callId: string, estimate: number) {
    this.amount(estimate);
    const envelope = this.current(owner, attempt);
    if (!callId) throw new Error('Missing call id');
    const existing = this.calls.get(callId);
    if (existing) {
      if (
        existing.owner !== owner ||
        existing.attempt !== attempt ||
        existing.estimate !== estimate
      )
        throw new Error('Conflicting transfer');
      return;
    }
    if (estimate > envelope.balance) throw new Error('Owned balance exceeded');
    envelope.balance -= estimate;
    this.calls.set(callId, { owner, attempt, estimate });
    this.snapshot();
  }

  settle(callId: string, charge: number) {
    this.amount(charge);
    const call = this.calls.get(callId);
    if (!call || charge > call.estimate) throw new Error('Invalid settlement');
    if (call.charge !== undefined && call.charge !== charge)
      throw new Error('Conflicting settlement');
    call.charge = charge;
    this.snapshot();
  }

  close(owner: string, attempt: number) {
    // Call holds survive closure, including uncertain dispatches. A successful
    // validation/cache hit may release unused repair capacity here.
    this.current(owner, attempt).balance = 0;
  }

  fence(owner: string, attempt: number) {
    const envelope = this.current(owner, attempt);
    envelope.fenced = true;
  }

  recover(owner: string, oldAttempt: number, newAttempt: number) {
    const envelope = this.envelopes.get(owner);
    if (
      !envelope ||
      envelope.attempt !== oldAttempt ||
      !envelope.fenced ||
      !Number.isSafeInteger(newAttempt) ||
      newAttempt <= oldAttempt
    )
      throw new Error('Recovery requires a fenced prior attempt');
    // Release only untransferred balance. Outstanding calls retain holds.
    this.envelopes.set(owner, {
      attempt: newAttempt,
      balance: 0,
      fenced: false,
    });
  }

  private current(owner: string, attempt: number) {
    const envelope = this.envelopes.get(owner);
    if (!envelope || envelope.attempt !== attempt || envelope.fenced)
      throw new Error('Stale or fenced owner');
    return envelope;
  }

  private amount(value: number) {
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error('Expected nonnegative integer units');
  }
}
