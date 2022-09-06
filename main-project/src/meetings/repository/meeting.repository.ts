import { EntityRepository, Repository } from 'typeorm';
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
}
