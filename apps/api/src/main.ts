import { DigestsModule } from './modules/digests/digests.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { TopicsModule } from './modules/topics/topics.module';
import 'reflect-metadata';
import { Controller, Get, Module, Res, Injectable, OnModuleDestroy } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CqrsModule } from '@nestjs/cqrs';
import { resolve } from 'node:path';
import { database, redis } from './libs/db/connections';
@Injectable()
class HealthService implements OnModuleDestroy {
 readonly db = database(); readonly cache = redis();
 constructor() { this.cache.on('error', () => {}); }
 async check() { const checks = await Promise.allSettled([this.db.query('SELECT 1'), this.cache.ping()]); const database = checks[0].status === 'fulfilled'; const redis = checks[1].status === 'fulfilled'; return { status: database && redis ? 'ok' : 'degraded', database, redis }; }
 async onModuleDestroy() { await this.db.end(); this.cache.disconnect(); }
}
@Controller()
class HealthController {
 constructor(private readonly health: HealthService) {}
 @Get('healthz') async get(@Res({ passthrough: true }) response: { status: (code: number) => void }) { const result = await this.health.check(); response.status(result.status === 'ok' ? 200 : 503); return result; }
}
@Module({ imports: [DigestsModule, IngestionModule, ProfilesModule, TopicsModule, CqrsModule.forRoot(), ServeStaticModule.forRoot({ rootPath: resolve(__dirname, '../../web/dist'), exclude: ['/healthz', '/api/{*path}'] })], controllers: [HealthController], providers: [HealthService] })
class AppModule {}
async function bootstrap() { const app = await NestFactory.create(AppModule); app.enableShutdownHooks(); await app.listen(Number(process.env.PORT ?? 8000), '0.0.0.0'); }
void bootstrap();
