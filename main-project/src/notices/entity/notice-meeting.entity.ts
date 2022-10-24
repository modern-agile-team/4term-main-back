import { Meetings } from 'src/meetings/entity/meeting.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notices } from './notices.entity';

@Entity('notice_meetings')
export class NoticeMeeting extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Meetings, (meetings) => meetings.noticeMeetingNo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meeting_no' })
  meetingNo: number;

  @OneToOne((type) => Notices, (notices) => notices.noticeMeetings)
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
