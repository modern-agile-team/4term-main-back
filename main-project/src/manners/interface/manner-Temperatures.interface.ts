import { UserProfile } from 'src/users/entity/user-profile.entity';

export interface MannerTemperatureReadResponse {
  no: number;
  mannerScore: number;
  count: number;
  userProfile: UserProfile | number;
}
