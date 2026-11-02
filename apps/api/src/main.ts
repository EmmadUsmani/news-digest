import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app';
import { internalTools, proxyInternalTools } from './internal-tools';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Registered before routes and static files: /docs/* and /db/* go to the tools.
  app.use(proxyInternalTools(internalTools));
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 8000), '0.0.0.0');
}
void bootstrap();
