import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserManners } from './user-manners.entity';
import { Users } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Users, (users) => users.userProfile)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @JoinColumn({ name: 'major_no' })
  majorNo: number;

  @JoinColumn({ name: 'university_no' })
  universityNo: number;

  @OneToOne((type) => UserManners, (userManners) => userManners.userNo)
  @JoinColumn({ name: 'manner_no' })
  mannerNo: number;
}
