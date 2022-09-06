import { EntityRepository, Repository } from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { Meeting } from '../entity/meeting.entity';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {
  async createMeetingInfo(
    host: number,
    meetingNo: Meeting,
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
