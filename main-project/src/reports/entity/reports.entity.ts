import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportImages } from './report-images.entity';
import { Reportedboards } from './reported-board.entity';
import { ReportedUsers } from './reported-user.entity';

@Entity('reports')
export class Reports extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne(
    (type) => Reportedboards,
    (reportedboards) => reportedboards.reportNo,
  )
  reportedBoard: number;

  @OneToOne((type) => ReportedUsers, (reportedUsers) => reportedUsers.reportNo)
  reportedUser: number;

  @ManyToOne((type) => Users, (user) => user.report)
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToOne((type) => ReportImages, (reportImages) => reportImages.reportNo)
  reportImages: ReportImages;
}
