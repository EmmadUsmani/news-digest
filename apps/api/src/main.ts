import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app';
import { internalTools, proxyInternalTools } from './internal-tools';
import {
  installFatalLogging,
  logger,
  requestLogging,
} from './libs/observability/logging';
import { mountJobsBrowser } from './modules/operations/adapters/jobs-browser';
import { OperationsStatus } from './modules/operations/adapters/operations.status';

async function bootstrap() {
  installFatalLogging();
  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message: unknown) => logger.info({ message }, 'Nest'),
      error: (message: unknown, stack?: string) =>
        logger.error({ message, stack }, 'Nest'),
      warn: (message: unknown) => logger.warn({ message }, 'Nest'),
      debug: (message: unknown) => logger.debug({ message }, 'Nest'),
      verbose: (message: unknown) => logger.trace({ message }, 'Nest'),
    },
  });
  app.use(requestLogging());
  // Registered before routes and static files: /docs/* and /db/* go to the tools.
  app.use(proxyInternalTools(internalTools));
  mountJobsBrowser(app, app.get(OperationsStatus).queues);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 8000), '0.0.0.0');
}
void bootstrap();
