import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfile } from './user-images.entity';
import { Users } from './user.entity';

@Entity('user_manners')
export class UserManners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Users, (users) => users.mannerUserNo)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column('decimal', { precision: 6, scale: 1, default: 36.5 })
  statistics: number;

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.mannerNo)
  mannerNo: UserManners;
}
