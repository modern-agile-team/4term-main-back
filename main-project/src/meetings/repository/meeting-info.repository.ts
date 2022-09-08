import { Users } from 'src/users/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { Meetings } from '../entity/meeting.entity';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {
  async createMeetingInfo(
    host: Users,
    meetingNo: Meetings,
  ): Promise<MeetingInfo> {
    try {
      const meetingInfo = this.create({
        meetingNo,
        host,
      });
      await this.save(meetingInfo);
      return meetingInfo;
    } catch (error) {
      throw error;
    }
  }
}
