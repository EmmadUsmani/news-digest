import { topicOrderSchema, topicUpdateSchema } from '@digest/contracts';
import { TopicRepository } from './domain/topic.repository';
import { BadRequestException, Body, Controller, Get, Module, NotFoundException, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { PostgresTopicRepository } from './database/topic.repository';
@Controller('api/topics')
class TopicsController {
 constructor(private readonly topics: TopicRepository) {}
 @Post() async create(@Body() body: unknown) {
 const parsed = topicUpdateSchema.safeParse(body);
 if (!parsed.success) throw new BadRequestException('Provide complete topic settings with a name, bounded budgets and valid phrase rules');
 return this.topics.createDefault(parsed.data);
 }
 @Put('order') async reorder(@Body() body: unknown) {
 const parsed = topicOrderSchema.safeParse(body);
 if (!parsed.success) throw new BadRequestException('Provide a unique ordered list of all topic IDs');
 if (!await this.topics.reorderDefault(parsed.data.ids)) throw new BadRequestException('Topic list changed; reload and include every current topic exactly once');
 return this.topics.listDefault();
 }
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
