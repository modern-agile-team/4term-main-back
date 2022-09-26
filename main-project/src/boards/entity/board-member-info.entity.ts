import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Boards } from './board.entity';

@Entity('board_member_infos')
export class BoardMemberInfos extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'int', nullable: false })
  male: number;

  @Column({ type: 'int', nullable: false })
  female: number;

  @OneToOne((type) => Boards, (board) => board.boardMemberInfo)
  @JoinColumn({ name: 'board_no' })
  boardNo: number;
}
