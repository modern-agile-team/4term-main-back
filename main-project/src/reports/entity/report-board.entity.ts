import { Boards } from 'src/boards/entity/board.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
}
