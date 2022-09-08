import {
  BaseEntity,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from './board.entity';

// fk없음, entity취합 후 생성예정
@Entity('board_bookmarks')
export class BoardBookmark extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Board, (board) => board.boardBookmark)
  @JoinColumn({ name: 'board_no' })
  boardNo: Board;
}
