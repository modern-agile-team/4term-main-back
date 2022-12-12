import { UserProfile } from 'src/users/entity/user-profile.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('majors')
export class Majors extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: '50' })
  major: string;

  @OneToMany((type) => UserProfile, (userProfile) => userProfile.majorNo)
  userProfile: UserProfile[];
}
