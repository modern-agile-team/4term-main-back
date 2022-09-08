import { Injectable, BadGatewayException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { MeetingRepository } from './repository/meeting.repository';

export interface meetingResponseInfo {
  affectedRows: number;
  insertId?: number;
}

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,

    @InjectRepository(GuestMembersRepository)
    private readonly guestMembersRepository: GuestMembersRepository,

    @InjectRepository(HostMembersRepository)
    private readonly hosttMembersRepository: HostMembersRepository,
  ) {}

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meetings> {
    try {
      const { location, time, host } = createMeetingDto;
      const { affectedRows, insertId } =
        await this.meetingRepository.createMeeting({
          location,
          time,
        });
      if (!affectedRows) {
        throw new BadGatewayException(`meeting 생성 오류입니다.`);
      }
      const meeting = await this.meetingRepository.findMeetingById(insertId);
      const createInfoResult =
        await this.meetingInfoRepository.createMeetingInfo(host[0], meeting);
      if (!createInfoResult) {
        throw new BadGatewayException(`meeting 생성 오류입니다.`);
      }
      const hostsInfo = host.reduce((values, userNo) => {
        values.push({ meetingNo: meeting.no, userNo });
        return values;
      }, []);
      const addHostInfoResult =
        await this.hosttMembersRepository.addHostMembers(hostsInfo);
      if (addHostInfoResult !== host.length) {
        throw new BadGatewayException(`약속 host 데이터 추가 오류입니다`);
      }

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
