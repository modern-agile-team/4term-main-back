import { Manners } from 'src/manners/entity/manners.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardGuestMembers } from './board-guest-members.entity';
import { Boards } from './board.entity';

@Entity('board_guest_teams')
export class BoardGuestTeams extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Boards, (board) => board.guestTeams, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToMany(
    (type) => BoardGuestMembers,
    (boardGuestMembers) => boardGuestMembers.teamNo,
  )
  userNo: number;
}
