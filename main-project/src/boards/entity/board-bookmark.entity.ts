import { Users } from 'src/users/entity/user.entity';
import { Boards } from './board.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('board_bookmarks')
export class BoardBookmarks extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Boards, (board) => board.boardBookmark)
  @JoinColumn({ name: 'board_no' })
  boardNo: Boards;

  @ManyToOne((type) => Users, (user) => user.boardBookmark)
  @JoinColumn({ name: 'user_no' })
  userNo: Users;
}
