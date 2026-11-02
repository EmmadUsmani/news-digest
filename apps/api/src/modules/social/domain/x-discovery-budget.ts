export interface XDiscoveryUsage {
  inputTokens: number;
  outputTokens: number;
  postsFetched: number;
  profilesFetched: number;
}
export interface XDiscoveryPrice {
  // Dollars per million tokens; dollars per individual post/profile.
  inputPerMillion: number;
  outputPerMillion: number;
  perPost: number;
  perProfile: number;
}
export interface XDiscoveryCaps {
  dailyMicros: number;
  monthlyMicros: number;
}
export const xDiscoveryCaps: Readonly<XDiscoveryCaps> = Object.freeze({
  dailyMicros: 400000,
  monthlyMicros: 12000000,
});
export function validateXCaps(caps: XDiscoveryCaps) {
  if (
    !Number.isSafeInteger(caps.dailyMicros) ||
    !Number.isSafeInteger(caps.monthlyMicros) ||
    caps.dailyMicros < 0 ||
    caps.monthlyMicros < 0 ||
    caps.dailyMicros > xDiscoveryCaps.dailyMicros ||
    caps.monthlyMicros > xDiscoveryCaps.monthlyMicros
  )
    throw new Error('Invalid X discovery caps');
}
export function xDiscoveryCost(usage: XDiscoveryUsage, price: XDiscoveryPrice) {
  if (
    Object.values(usage).some((n) => !Number.isSafeInteger(n) || n < 0) ||
    Object.values(price).some((n) => !Number.isFinite(n) || n < 0)
  )
    throw new Error('Invalid X discovery usage or price');
  // Charge all input tokens at the ordinary rate, including any cache hits.
  const micros = Math.ceil(
    usage.inputTokens * price.inputPerMillion +
      usage.outputTokens * price.outputPerMillion +
      usage.postsFetched * price.perPost * 1000000 +
      usage.profilesFetched * price.perProfile * 1000000,
  );
  if (!Number.isSafeInteger(micros))
    throw new Error('X discovery cost overflow');
  return micros;
}
