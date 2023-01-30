import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardGuests } from './board-guest.entity';
import { Boards } from './board.entity';

@Entity('board_guest_teams')
export class BoardGuestTeams extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Boards, (boards) => boards.teamNo, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToMany((type) => BoardGuests, (boardGuests) => boardGuests.teamNo, {
    onDelete: 'CASCADE',
  })
  boardGuest: BoardGuests;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
