import 'reflect-metadata';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { checkDatabase, database } from './libs/db/connections';
import { PostgresPreviewRepository } from './modules/digests/database/preview.repository';
import { PreviewRepository } from './modules/digests/domain/preview.repository';
import { PostgresContentRepository } from './modules/ingestion/database/content.repository';
import { ContentRepository } from './modules/ingestion/domain/ports';
import { PostgresProfileRepository } from './modules/profiles/database/profile.repository';
import { ProfileRepository } from './modules/profiles/domain/profile.repository';
import { PostgresBlueskyRepository } from './modules/social/database/bluesky.repository';
import { PostgresRedditRepository } from './modules/social/database/reddit.repository';
import { PostgresSocialRepository } from './modules/social/database/social.repository';
import { PostgresTopicRepository } from './modules/topics/database/topic.repository';
import { TopicRepository } from './modules/topics/domain/topic.repository';

// Deliberately do not import AppModule: console startup has no transport or jobs.
const repositories = {
  profiles: ProfileRepository,
  topics: TopicRepository,
  content: ContentRepository,
  digests: PreviewRepository,
  social: PostgresSocialRepository,
  reddit: PostgresRedditRepository,
  bluesky: PostgresBlueskyRepository,
};
const socialProviders = [
  PostgresSocialRepository,
  PostgresRedditRepository,
  PostgresBlueskyRepository,
].map((provide) => ({
  provide,
  useFactory: () => {
    const repository = new provide();
    return Object.assign(repository, {
      onModuleDestroy: () => repository.db.end(),
    });
  },
}));
const ConsoleDatabase = Symbol('ConsoleDatabase');
@Module({
  providers: [
    {
      provide: ProfileRepository,
      useFactory: () => new PostgresProfileRepository(),
    },
    {
      provide: TopicRepository,
      useFactory: () => new PostgresTopicRepository(),
    },
    {
      provide: ContentRepository,
      useFactory: () => new PostgresContentRepository(),
    },
    {
      provide: PreviewRepository,
      useFactory: () => new PostgresPreviewRepository(),
    },
    ...socialProviders,
    {
      provide: ConsoleDatabase,
      useFactory: () => {
        const db = database();
        return {
          query: db.query.bind(db),
          check: () => checkDatabase(db),
          onModuleDestroy: () => db.end(),
        };
      },
    },
  ],
})
class ConsoleModule {}

export async function createConsole() {
  const app = await NestFactory.createApplicationContext(ConsoleModule, {
    logger: false,
  });
  return {
    app,
    get: app.get.bind(app),
    db: app.get<{
      query: ReturnType<typeof database>['query'];
      check: () => Promise<void>;
    }>(ConsoleDatabase),
    ...Object.fromEntries(
      Object.entries(repositories).map(([name, token]) => [
        name,
        app.get(token),
      ]),
    ),
    ProfileRepository,
    TopicRepository,
    ContentRepository,
    PreviewRepository,
    PostgresSocialRepository,
    PostgresRedditRepository,
    PostgresBlueskyRepository,
  };
}
