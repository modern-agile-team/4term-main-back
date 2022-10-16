import { UserProfile } from 'src/users/entity/user-profile.entity';

export interface MannerTemperatureReadResponse {
  mannerTemperature: number;
  count: number;
  userProfile: UserProfile | number;
}

export interface MannerTemperatureDetail {
  mannerTemperature: number;
  count: number;
  userProfile: UserProfile | number;
}
