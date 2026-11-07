import type {
  DevelopmentAllowance,
  DevelopmentProvider,
} from './development-spend.port';

/** Phase-0 development pools are lifetime totals, in integer microdollars.
 * Callers must include settled charges and outstanding/uncertain reservations.
 * No clock input: these pools never renew at a day or month boundary.
 * Prepared policy only; production accounting does not use this helper.
 */
const ceilings = Object.freeze({ anthropic: 5_000_000, xai: 2_000_000 });

export function developmentSpendAllowance(
  provider: DevelopmentProvider,
  configuredCap: number,
  committedMicros: number,
): DevelopmentAllowance {
  if (
    !Object.hasOwn(ceilings, provider) ||
    !Number.isSafeInteger(configuredCap) ||
    configuredCap < 0 ||
    configuredCap > ceilings[provider] ||
    !Number.isSafeInteger(committedMicros) ||
    committedMicros < 0
  )
    throw new Error('Invalid development spend pool');

  // Floor fractional microdollars so a reservation cannot cross 75%.
  const stopAtMicros = Math.floor((configuredCap * 3) / 4);
  return {
    capMicros: configuredCap,
    stopAtMicros,
    availableMicros: Math.max(0, stopAtMicros - committedMicros),
    mustReport: committedMicros >= stopAtMicros,
  };
}
