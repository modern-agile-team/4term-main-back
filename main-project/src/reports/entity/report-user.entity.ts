import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportUserImages } from './report-user-image.entity';
import { Reports } from './reports.entity';

@Entity('report_users')
export class ReportUsers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Reports, (reports) => reports.reportedBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_no' })
  reportNo: number;

  @ManyToOne((type) => Users, (users) => users.reportUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_user_no' })
  targetUserNo: number;

  @OneToMany(
    (type) => ReportUserImages,
    (reportUserImages) => reportUserImages.reportUserNo,
  )
  reportUserImage: ReportUserImages[];
}
