import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { CreateMeetingDto } from '../dto/createMeeting.dto';
import { Meetings } from '../entity/meeting.entity';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meetings> {
    try {
      const { location, time } = createMeetingDto;
      const meeting = this.create({
        location,
        time,
      });
      await this.save(meeting);

      return meeting;
    } catch (err) {
      throw err;
    }
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
