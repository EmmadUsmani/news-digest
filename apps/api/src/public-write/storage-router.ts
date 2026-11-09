import type { Pool } from 'pg';

import { PublicSourceWriter } from '../modules/topics/database/public-source-writer';
import { publicWriteRouter } from './router';
import { publicSourceHttp } from './source-http';

// Prepared only; the caller owns the pool and account authorization lifecycle.
// Mount before body parsing. Disabled composition never opens storage.
export function prepareStoredPublicWriteRouter(options: {
  enabled: boolean;
  origin: string;
  pool: () => Pool;
  authenticate: Parameters<typeof publicSourceHttp>[0]['authenticate'];
  authorize: Parameters<typeof publicWriteRouter>[0]['authorize'];
  now?: () => Date;
}) {
  return publicWriteRouter({
    enabled: options.enabled,
    source: () =>
      publicSourceHttp({
        enabled: true,
        origin: options.origin,
        authenticate: options.authenticate,
        now: options.now,
        writer: new PublicSourceWriter(options.pool()),
      }),
    authorize: options.authorize,
  });
}
