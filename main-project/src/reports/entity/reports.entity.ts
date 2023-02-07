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
import { ReportBoardImages } from './report-board-images.entity';
import { ReportBoards } from './report-board.entity';
import { ReportUsers } from './report-user.entity';

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
  reportedBoard: number;

  @OneToOne((type) => ReportUsers, (reportUser) => reportUser.reportNo)
  reportedUser: number;

  @ManyToOne((type) => Users, (user) => user.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_no' })
  userNo: number;
}
