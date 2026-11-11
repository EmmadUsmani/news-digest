import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app';
import { proxyInternalTools, selectInternalTools } from './internal-tools';
import { startExternalMetrics } from './libs/observability/external-metrics';
import { httpMetrics } from './libs/observability/http-metrics';
import {
  installFatalLogging,
  logger,
  requestLogging,
} from './libs/observability/logging';
import { startQueueMetrics } from './libs/observability/queue-metrics';
import { startRuntimeMetrics } from './libs/observability/runtime-metrics';
import { startBudgetMetrics } from './modules/operations/adapters/budget-metrics';
import { OperationsStatus } from './modules/operations/adapters/operations.status';
import { mountQueueTools } from './modules/operations/adapters/public-jobs-browser';
import {
  ACCESS_HTTP,
  type AccessHttpRuntime,
} from './public-write/access-provider';
import { PublicErrorFilter } from './public-write/public-error-filter';

async function bootstrap() {
  installFatalLogging();
  const { registry } = startRuntimeMetrics('api', 9464);
  startExternalMetrics(registry);
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
  const publicMode = process.env.PUBLIC_MODE === '1';
  if (publicMode) app.useGlobalFilters(new PublicErrorFilter());
  app.use(requestLogging());
  app.use(httpMetrics(registry));
  // One runtime owns bounded account transport and the selected authorization
  // guard. Mount before Nest installs body parsers or tool proxies.
  app.use(app.get<AccessHttpRuntime>(ACCESS_HTTP).middleware);
  // Registered before routes and static files: /docs/* and /db/* go to the tools.
  app.use(proxyInternalTools(selectInternalTools(publicMode)));
  const queues = app.get(OperationsStatus).queues;
  mountQueueTools(app, queues, publicMode);
  startQueueMetrics(registry, queues);
  startBudgetMetrics(registry);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 8000), '0.0.0.0');
}
void bootstrap();
