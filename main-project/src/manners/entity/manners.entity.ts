import { BoardGuestTeams } from 'src/boards/entity/board-guest-team.entity';
import { BoardHostMembers } from 'src/boards/entity/board-host-members.entity';
import { Boards } from 'src/boards/entity/board.entity';
import { MeetingInfo } from 'src/meetings/entity/meeting-info.entity';
import { Meetings } from 'src/meetings/entity/meeting.entity';
import { UserProfile } from 'src/users/entity/user-profile.entity';
import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('manners')
export class Manners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column()
  grade: number;

  @OneToOne((type) => UserProfile, (userProfile) => userProfile.mannerNo, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_no' })
  userProfileNo: number;

  @OneToOne((type) => Meetings, (meetings) => meetings.mannerNo)
  @JoinColumn({ name: 'meetings_no' })
  meetingNo: number;

  @OneToOne((type) => Users, (users) => users.mannerNo)
  @JoinColumn({ name: 'no' })
  userNo: number;

  @OneToOne(
    (type) => BoardGuestTeams,
    (boardGuestTeams) => boardGuestTeams.mannerNo,
  )
  @JoinColumn({ name: 'guest_board_no' })
  guestMembersboardNo: number;

  @OneToOne(
    (type) => BoardHostMembers,
    (boardHostMembers) => boardHostMembers.mannerNo,
  )
  @JoinColumn({ name: 'host_board_no' })
  hostMemebersboardNo: number;
}
