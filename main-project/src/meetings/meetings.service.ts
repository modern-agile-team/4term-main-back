import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { Meeting } from './entity/meeting.entity';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { MeetingRepository } from './repository/meeting.repository';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,
    private readonly meetingInfoRepository: MeetingInfoRepository,
  ) {}

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    try {
      const meeting = await this.meetingRepository.createMeeting(
        createMeetingDto,
      );
      await this.meetingInfoRepository.createMeetingInfo(
        createMeetingDto.host,
        meeting,
      );

      return meeting;
    } catch (err) {
      throw err;
    }
  }
}
