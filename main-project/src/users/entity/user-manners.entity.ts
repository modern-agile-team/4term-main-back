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

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.no)
  @JoinColumn({ name: 'user_profile_no' })
  nullable: false;
  userProfileNo: number;

  @Column('decimal', { precision: 6, scale: 1, default: 36.5 })
  statistics: number;
}
