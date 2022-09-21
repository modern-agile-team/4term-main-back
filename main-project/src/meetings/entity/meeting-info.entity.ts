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

  @Column('int', { name: 'guest_headcount', default: 0 })
  guestHeadcount: number;

  @Column('int', { name: 'host_headcount', default: 0 })
  hostHeadcount: number;

  @ManyToOne((type) => Users, (user) => user.meetingGuest)
  @JoinColumn({ name: 'guest' })
  guest: Users | number;

  @ManyToOne((type) => Users, (user) => user.meetingHost)
  @JoinColumn({ name: 'host' })
  host: Users | number;

  @OneToOne((type) => Meetings, (meeting) => meeting.meetingInfo, {
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: Meetings | number;
}
