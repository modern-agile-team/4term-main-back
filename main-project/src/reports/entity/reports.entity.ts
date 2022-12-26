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
import { ReportBoards } from './board-reports.entity';
import { ReportUsers } from './user-reports.entity';

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

  @OneToOne((type) => ReportBoards, (reportBoards) => reportBoards.reportNo)
  reportBoard: number;

  @OneToOne((type) => ReportUsers, (reportUser) => reportUser.reportNo)
  reportUser: number;

  @ManyToOne((type) => Users, (user) => user.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToOne((type) => ReportImages, (reportImages) => reportImages.reportNo)
  reportImages: ReportImages;
}
