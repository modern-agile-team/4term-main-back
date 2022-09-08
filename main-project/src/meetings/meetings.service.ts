import { Injectable, BadGatewayException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { MeetingRepository } from './repository/meeting.repository';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,
  ) {}

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meetings> {
    try {
      const meeting: Meetings = await this.meetingRepository.createMeeting(
        createMeetingDto,
      );
      await this.meetingInfoRepository.createMeetingInfo(
        createMeetingDto.host[0],
        meeting,
      );

      return meeting;
    } catch (err) {
      throw err;
    }
  }

  async updateMeeting(
    meetingNo,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<void> {
    const affected = await this.meetingRepository.updateMeeting(
      meetingNo,
      updateMeetingDto,
    );
    if (!affected) {
      throw new BadGatewayException(`약속 수정 관련 오류입니다.`);
    }
  }

  async acceptMeeting(meetingNo): Promise<void> {
    try {
      const affected = await this.meetingRepository.acceptMeeting(meetingNo);
      if (!affected) {
        throw new BadGatewayException(`약속 수락 관련 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }
}
