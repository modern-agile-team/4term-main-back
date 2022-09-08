import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Meetings } from './meeting.entity';

@Entity('meeting_info')
export class MeetingInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  // @Column()
  // host: number;

  // @Column({ default: null })
  // guest: number;

  @ManyToOne((type) => Users, (user) => user.meetingGuest)
  guest: Users;

  @ManyToOne((type) => Users, (user) => user.meetingHost)
  host: Users;

  @OneToOne((type) => Meetings, (meeting) => meeting.meetingInfo, {
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meetings;
}
