import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('manners')
export class Manners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'total_grade', default: 0 })
  totalGrade: number;

  @Column({ name: 'grade_count', default: 0 })
  gradeCount: number;

  @OneToOne((type) => Users, (users) => users.mannerNo, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_no' })
  userNo: number;
}
