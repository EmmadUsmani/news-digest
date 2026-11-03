import { sameEvent } from '../domain/cluster';
import { sameEventWithStudioClosure } from '../domain/studio-event';

// Keep unset in production until the protected scheduled run is acknowledged.
// Selecting a matcher is configuration; the domain never reads environment state.
export function editionEventMatcher(
  value = process.env.EDITION_EVENT_GROUPING_ENABLED,
) {
  return value === '1' ? sameEventWithStudioClosure : sameEvent;
}
