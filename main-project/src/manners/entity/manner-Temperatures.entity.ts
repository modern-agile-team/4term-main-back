import { UserProfile } from 'src/users/entity/user-profile.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('manner_temperature')
export class MannersTemperature extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column('decimal', {
    precision: 6,
    scale: 1,
    default: 36.5,
    name: 'manner_temperature',
  })
  mannerTemperature: number;

  @Column({ default: 0 })
  count: number;

  @OneToOne(
    (type) => UserProfile,
    (userProfile) => userProfile.mannerTemperature,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'user_profile_no' })
  userProfile: UserProfile | number;
}
