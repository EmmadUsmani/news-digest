import type { IncomingMessage, ServerResponse } from 'node:http';

import { publicSourceHttp } from './source-http';
import { publicTopicHttp } from './topic-http';

type Middleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => unknown;

// Prepared only. Install before body parsing and legacy controllers. Source and topic
// writes own their transaction and must never enter standalone admission.
export function publicWriteRouter(options: {
  enabled: boolean;
  source: () => ReturnType<typeof publicSourceHttp>;
  topic: () => ReturnType<typeof publicTopicHttp>;
  authorize: () => Middleware;
}) {
  if (!options.enabled)
    return (
      _request: IncomingMessage,
      _response: ServerResponse,
      next: () => void,
    ) => next();
  const source = options.source();
  const topic = options.topic();
  const authorize = options.authorize();
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) =>
    source(request, response, () => {
      topic(request, response, () => {
        void authorize(request, response, next);
      });
    });
}
