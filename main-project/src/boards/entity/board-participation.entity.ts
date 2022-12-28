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

@Entity('board_participation')
export class BoardParticipation extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.guestMembers, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Boards, (boards) => boards.teamNo, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToMany((type) => BoardGuests, (boardGuests) => boardGuests.teamNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  boardGuest: BoardGuests;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;
}
