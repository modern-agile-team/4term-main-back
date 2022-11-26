import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Boards } from './board.entity';

@Entity('board_guest')
export class BoardGuests extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.guestMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne(
    (type) => Boards,
    (boards) => boards.guests,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'board_no' })
  boardNo: number;
}
