import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';

@Entity('user_manners')
export class UserManners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.mannerNo, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_no' })
  userProfileNo: number;

  @Column('decimal', { precision: 6, scale: 1, default: 36.5 })
  statistics: number;
}
