import { Controller, Get, Module } from '@nestjs/common';
import { ProfileRepository } from './domain/profile.repository';
import { PostgresProfileRepository } from './database/profile.repository';
@Controller('api/profile')
class ProfilesController {
 constructor(private readonly profiles: ProfileRepository) {}
 @Get() get() { return this.profiles.getDefault(); }
}
@Module({ controllers: [ProfilesController], providers: [{ provide: ProfileRepository, useClass: PostgresProfileRepository }] })
export class ProfilesModule {}
