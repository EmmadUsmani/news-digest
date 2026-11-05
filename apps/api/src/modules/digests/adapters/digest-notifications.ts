import type { Logger } from 'pino';

import { logger } from '../../../libs/observability/logging';
import {
  DigestNotifications,
  type DigestPublished,
} from '../domain/digest-published';

export class LogDigestNotifications extends DigestNotifications {
  published(event: DigestPublished): Promise<void> {
    logger.info({ event: 'digest.published', ...event }, 'Digest published');
    return Promise.resolve();
  }
}

// Publication is already committed. A delivery failure must never fail the job.
// This log-only hook is best effort; durable delivery would need an outbox.
export async function announceDigest(
  notifications: DigestNotifications,
  event: DigestPublished,
  log: Logger = logger,
): Promise<void> {
  try {
    await notifications.published(event);
  } catch {
    log.warn(
      { event: 'digest.notification.failure', editionId: event.editionId },
      'Digest publication notification failed',
    );
  }
}
