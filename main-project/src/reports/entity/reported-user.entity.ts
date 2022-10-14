import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reports } from './reports.entity';

@Entity('reported_users')
export class ReportedUsers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Reports, (reports) => reports.reportedBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_no' })
  reportNo: number;

  @ManyToOne((type) => Users, (users) => users.reportedUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_user_no' })
  targetUserNo: number;
}
