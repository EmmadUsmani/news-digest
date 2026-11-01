import { scheduleSchema } from '@digest/contracts';
import { validateSchedule, durationMilliseconds } from './domain/schedule';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  Put,
} from '@nestjs/common';
import { ProfileRepository } from './domain/profile.repository';
import { PostgresProfileRepository } from './database/profile.repository';
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
