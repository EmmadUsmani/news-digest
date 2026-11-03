import type { Candidate } from './rank';

// Opt-in only: an abandoned fast-travel experiment is distinct from a shipped
// feature, an announcement of the remake, or changes to another game system.
function abandonedFastTravel(candidate: Candidate): string | null {
  const title = candidate.title.normalize('NFKC').toLowerCase();
  if (
    /[?？]|\b(not|never|rumou?r|reportedly|might|could|may|would|should|if|unless|allegedly|previously|last year|years? ago|will|expected)\b/.test(
      title,
    ) ||
    /\b(?:19|20)\d{2}\b/.test(title)
  )
    return null;
  const publisherFirst =
    /^[\p{L}][\p{L} '-]{1,40} tried adding fast travel to (.+?) remake, before devs realised ["“]we were missing out on the moments of discovery["”]$/u.exec(
      title,
    );
  const gameFirst =
    /^(.+?) remake devs tried adding (?:even more )?fast travel(?: points)?, but that sucked$/.exec(
      title,
    );
  const identity = (publisherFirst ?? gameFirst)?.[1];
  // Keep the complete subtitle and sequel. Only normalize the established
  // franchise alias; do not collapse arbitrary games with a shared subtitle.
  if (!identity || !/^[\p{L}\p{N} :'-]{3,100}$/u.test(identity)) return null;
  return identity.replace(/^the legend of zelda:/, 'zelda:');
}

export function sameAbandonedFastTravel(a: Candidate, b: Candidate): boolean {
  const left = abandonedFastTravel(a);
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  return (
    left !== null &&
    left === abandonedFastTravel(b) &&
    Number.isFinite(delta) &&
    delta <= 36 * 3600000
  );
}

// These reports concern a specific dungeon adjustment, not every change made
// to a remake. Require the shared quoted rationale and explicit remake context.
function waterTempleAdjustment(candidate: Candidate): string | null {
  const title = candidate.title.normalize('NFKC').toLowerCase();
  if (
    /[?？]|\b(not|never|rumou?r|reportedly|might|could|may|would|if|previously|last year|years? ago|will)\b/.test(
      title,
    )
  )
    return null;
  const short =
    /^og (.+?) dev responsible for the infamous water temple used the remake to atone$/.exec(
      title,
    );
  const quoted =
    /^the director of the original (.+?) calls fixing the infamous water temple [‘']overdue homework[’']$/.exec(
      title,
    );
  if (!short && !quoted) return null;
  if (
    short &&
    !/\b(?:overdue homework|do something about the water temple)\b/i.test(
      candidate.excerpt,
    )
  )
    return null;
  if (
    quoted &&
    !/\b(?:remake|remaking|this version)\b/i.test(candidate.excerpt)
  )
    return null;
  const identity = (short ?? quoted)![1];
  if (!/^[\p{L}\p{N} :'-]{3,100}$/u.test(identity)) return null;
  return identity.replace(/^the legend of zelda:/, 'zelda:');
}

export function sameWaterTempleAdjustment(a: Candidate, b: Candidate): boolean {
  const left = waterTempleAdjustment(a);
  const delta = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  return (
    left !== null &&
    left === waterTempleAdjustment(b) &&
    Number.isFinite(delta) &&
    delta <= 36 * 3600000
  );
}
