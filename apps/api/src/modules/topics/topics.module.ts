import { topicSourcesSchema, topicOrderSchema, topicUpdateSchema } from '@digest/contracts';
import { TopicRepository } from './domain/topic.repository';
import { BadRequestException, Body, Controller, Delete, Get, Module, NotFoundException, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { PostgresTopicRepository } from './database/topic.repository';
@Controller('api/topics')
class TopicsController {
 constructor(private readonly topics: TopicRepository) {}
 @Get('sources') catalog() { return this.topics.catalog(); }
 @Put(':id/sources') async connect(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) {
 const parsed = topicSourcesSchema.safeParse(body);
 if (!parsed.success) throw new BadRequestException('Provide unique source IDs from the catalog');
 const result = await this.topics.connectDefault(id, parsed.data.ids);
 if (result === false) throw new BadRequestException('Unknown source; reload the source catalog');
 if (!result) throw new NotFoundException('Topic not found');
 return result;
 }
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
 @Delete(':id') async remove(@Param('id', new ParseUUIDPipe()) id: string) {
 const result = await this.topics.deleteDefault(id);
 if (!result) throw new NotFoundException('Topic not found');
 return result;
 }
 @Get() get() { return this.topics.listDefault(); }
}
@Module({ controllers: [TopicsController], providers: [{ provide: TopicRepository, useClass: PostgresTopicRepository }] })
export class TopicsModule {}
