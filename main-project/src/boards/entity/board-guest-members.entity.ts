import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardGuestTeams } from './board-guest-team.entity';

@Entity('board_guest_members')
export class BoardGuestMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.guestMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: Users;

  @ManyToOne(
    (type) => BoardGuestTeams,
    (boardGuestTeams) => boardGuestTeams.userNo,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'team_no' })
  teamNo: BoardGuestTeams;
}
