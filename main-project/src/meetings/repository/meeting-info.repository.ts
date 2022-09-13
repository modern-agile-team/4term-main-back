import { Users } from 'src/users/entity/user.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { MeetingInfo } from '../entity/meeting-info.entity';
import { Meetings } from '../entity/meeting.entity';

@EntityRepository(MeetingInfo)
export class MeetingInfoRepository extends Repository<MeetingInfo> {
  async createMeetingInfo(host: Users, meeting: Meetings): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'meeting_info',
      )
        .insert()
        .into(MeetingInfo)
        .values({
          meetingNo: meeting,
          host,
        })
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}
