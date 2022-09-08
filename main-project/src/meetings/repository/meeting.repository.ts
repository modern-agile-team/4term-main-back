import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Meetings } from '../entity/meeting.entity';
import { meetingResponseInfo } from '../meetings.service';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async createMeeting(meetingInfo): Promise<meetingResponseInfo> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('meetings')
        .insert()
        .into(Meetings)
        .values(meetingInfo)
        .execute();

      return raw;
    } catch (err) {
      throw err;
    }
  }

  async findMeetingById(meetingNo: number): Promise<Meetings> {
    try {
      const meeting = await this.createQueryBuilder('meetings')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getOne();

      return meeting;
    } catch (error) {}
  }

  async updateMeeting(meetingNo, updatedMeetingInfo): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeetingInfo)
        .where('no = :no', { no: meetingNo })
        .execute();

      return affected;
    } catch (error) {
      throw error;
    }
  }

  async acceptMeeting(meetingNo): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set({ isAccepted: true })
        .where('no = :no', { no: meetingNo })
        .execute();

      return affected;
    } catch (error) {
      throw error;
    }
  }
}
