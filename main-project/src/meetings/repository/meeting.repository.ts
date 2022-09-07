import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { CreateMeetingDto } from '../dto/createMeeting.dto';
import { Meeting } from '../entity/meeting.entity';

@EntityRepository(Meeting)
export class MeetingRepository extends Repository<Meeting> {
  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
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
        .update(Meeting)
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
        .update(Meeting)
        .set({ isAccepted: true })
        .where('no = :no', { no: meetingNo })
        .execute();

      return affected;
    } catch (error) {
      throw error;
    }
  }
}
