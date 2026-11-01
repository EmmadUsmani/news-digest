import type { ProfileSettings } from '@digest/contracts';
export abstract class ProfileRepository { abstract getDefault(): Promise<ProfileSettings>; }
