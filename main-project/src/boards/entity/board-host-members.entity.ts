import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Boards } from './board.entity';

@Entity('board_host_members')
export class BoardHostMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.hostMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Boards, (board) => board.hostMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;
}
