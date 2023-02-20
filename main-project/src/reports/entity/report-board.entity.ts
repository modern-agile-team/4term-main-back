import { Boards } from 'src/boards/entity/board.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportBoardImages } from './report-board-images.entity';
import { Reports } from './reports.entity';

@Entity('report_boards')
export class ReportBoards extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Reports, (reports) => reports.reportedBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_no' })
  reportNo: number;

  @ManyToOne((type) => Boards, (boards) => boards.boardReport, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_board_no' })
  targetBoardNo: number;

  @OneToMany(
    (type) => ReportBoardImages,
    (reportBoardImages) => reportBoardImages.reportBoardNo,
  )
  reportBoardImage: ReportBoardImages[];
}
