import type { ProfileSettings, ScheduleSettings } from '@digest/contracts';
export abstract class ProfileRepository { abstract updateDefault(schedule: ScheduleSettings): Promise<ProfileSettings>; abstract getDefault(): Promise<ProfileSettings>; }
