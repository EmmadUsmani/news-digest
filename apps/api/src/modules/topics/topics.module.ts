import { topicUpdateSchema } from '@digest/contracts';
import { TopicRepository } from './domain/topic.repository';
import { BadRequestException, Body, Controller, Get, Module, NotFoundException, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { PostgresTopicRepository } from './database/topic.repository';
@Controller('api/topics')
class TopicsController {
 constructor(private readonly topics: TopicRepository) {}
 @Put(':id') async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) {
 const parsed = topicUpdateSchema.safeParse(body);
 if (!parsed.success) throw new BadRequestException('Provide complete topic settings with a name, bounded budgets and valid phrase rules');
 const topic = await this.topics.updateDefault(id, parsed.data);
 if (!topic) throw new NotFoundException('Topic not found');
 return topic;
 }
 @Get() get() { return this.topics.listDefault(); }
}
@Module({ controllers: [TopicsController], providers: [{ provide: TopicRepository, useClass: PostgresTopicRepository }] })
export class TopicsModule {}
