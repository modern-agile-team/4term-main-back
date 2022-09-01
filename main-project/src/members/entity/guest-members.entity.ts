import { Meeting } from 'src/meetings/entity/meeting.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('guest_members')
export class GuestMembers extends BaseEntity {
  @PrimaryGeneratedColumn()
  noo: number;

  @Column()
  user_no: number;

  @OneToOne((type) => Meeting, (meeting) => meeting.meetingGuestMembers, {
    nullable: false,
  })
  @JoinColumn({ name: 'meeting_no' })
  meeting: Meeting;
}
