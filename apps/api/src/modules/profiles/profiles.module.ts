import { scheduleSchema } from '@digest/contracts';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  Put,
} from '@nestjs/common';

import { PostgresProfileRepository } from './database/profile.repository';
import { ProfileRepository } from './domain/profile.repository';
import { durationMilliseconds, validateSchedule } from './domain/schedule';
@Controller('api/profile')
class ProfilesController {
  constructor(private readonly profiles: ProfileRepository) {}
  @Put('schedule') async update(@Body() body: unknown) {
    const parsed = scheduleSchema.safeParse(body);
    if (!parsed.success)
      throw new BadRequestException(
        'Provide complete schedule settings and budgets between 0 and 20',
      );
    const valid = validateSchedule(parsed.data);
    if (!valid.ok) throw new BadRequestException(valid.error);
    if (durationMilliseconds(parsed.data.coverageWindow)! > 31 * 86400000)
      throw new BadRequestException('Coverage window cannot exceed 31 days');
    return this.profiles.updateDefault(parsed.data);
  }
  @Get() get() {
    return this.profiles.getDefault();
  }
}
@Module({
  controllers: [ProfilesController],
  providers: [
    { provide: ProfileRepository, useClass: PostgresProfileRepository },
  ],
})
export class ProfilesModule {}
