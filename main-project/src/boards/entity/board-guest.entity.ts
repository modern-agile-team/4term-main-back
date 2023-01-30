import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BoardGuestTeams } from './board-guest-team.entity';

@Entity('board_guests')
export class BoardGuests extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.boardGuest, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne(
    (type) => BoardGuestTeams,
    (boardParticipation) => boardParticipation.boardGuest,
    {
      onDelete: 'CASCADE',
      nullable: false,
    },
  )
  @JoinColumn({ name: 'team_no' })
  teamNo: number;
}
