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

@Entity('reported_boards')
export class Reportedboards extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Reports, (reports) => reports.reportedBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'report_no' })
  reportNo: number;

  @ManyToOne((type) => Boards, (boards) => boards.reportedBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_board_no' })
  targetBoardNo: number;
}
