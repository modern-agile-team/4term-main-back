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

  async saveMeetingGuest(guest: number, meeting: Meetings): Promise<number> {
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

  async getMeetingInfoById(meetingNo: number): Promise<MeetingInfo> {
    const meetingInfo: MeetingInfo = await this.createQueryBuilder(
      'meeting_info',
    )
      .select([
        'meeting_info.host',
        'meeting_info.guest',
        'meeting_info.guestHeadcount AS guestHeadcount',
        'meeting_info.hostHeadcount AS hostHeadcount',
      ])
      .where('meeting_info.meetingNo = :meetingNo', { meetingNo })
      .getRawOne();

    return meetingInfo;
  }
}
