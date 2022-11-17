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

  @OneToMany((type) => Users, (users) => users.hostMembers, {
    onDelete: 'CASCADE',
  })
  userNo: Users;

  @ManyToOne((type) => Boards, (board) => board.hostMember, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: Boards;
}
