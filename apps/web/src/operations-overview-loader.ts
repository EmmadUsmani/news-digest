import type { QueryClient } from '@tanstack/react-query';

import {
  adminEditionQuery,
  healthQuery,
  publicStatusQuery,
  statusQuery,
} from './queries';

export function loadOperationsOverview(
  client: QueryClient,
  publicMode: boolean,
) {
  // Branch before constructing private reads: even an admin in public mode
  // receives the public contract, with no private prefetch or cache fallback.
  if (publicMode)
    return Promise.allSettled([client.ensureQueryData(publicStatusQuery)]);
  return Promise.allSettled([
    client.ensureQueryData(adminEditionQuery),
    client.ensureQueryData(healthQuery),
    client.ensureQueryData(statusQuery),
  ]);
}
