import { Users } from 'src/users/entity/user.entity';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { Meetings } from '../entity/meeting.entity';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {
  async createMeetingInfo(meetingInfo): Promise<number> {
    try {
      meetingInfo.meetingNo = meetingInfo.meeting;
      delete meetingInfo.meeting;
      const { raw }: InsertResult = await this.createQueryBuilder(
        'meeting_info',
      )
        .insert()
        .into(MeetingInfo)
        .values(meetingInfo)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  async saveMeetingGuest(guest: Users, meeting: Meetings): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder(
        'meeting_info',
      )
        .update()
        .set({ guest })
        .where('meetingNo = :no', { no: meeting.no })
        .execute();

      return affected;
    } catch (error) {
      throw error;
    }
  }
}
