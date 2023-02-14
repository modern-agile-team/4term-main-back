import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportBoards } from './report-board.entity';

@Entity('report _board_images')
export class ReportBoardImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne(
    (type) => ReportBoards,
    (reportBoards) => reportBoards.reportBoardImage,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'report_board_no' })
  reportBoardNo: number;
}
