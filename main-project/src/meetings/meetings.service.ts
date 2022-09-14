import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SetGuestMembersDto } from 'src/members/dto/setGuestMembers.dto';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { Users } from 'src/users/entity/user.entity';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import { MeetingDetail, MeetingResponse } from './interface/meeting.interface';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { MeetingRepository } from './repository/meeting.repository';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,

    @InjectRepository(HostMembersRepository)
    private readonly hostMembersRepository: HostMembersRepository,

    @InjectRepository(GuestMembersRepository)
    private readonly guestMembersRepository: GuestMembersRepository,
  ) {}

  private async setMeetingDetail(
    meetingDetail: MeetingDetail,
  ): Promise<Meetings> {
    const { affectedRows, insertId }: MeetingResponse =
      await this.meetingRepository.createMeeting(meetingDetail);
    if (!affectedRows) {
      throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
    }
    const meeting: Meetings = await this.findMeetingById(insertId);

    return meeting;
  }

  private async setMeetingInfo(host: Users, meeting: Meetings): Promise<void> {
    const setMeetingInfoResult: number =
      await this.meetingInfoRepository.createMeetingInfo(host, meeting);
    if (!setMeetingInfoResult) {
      throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
    }
  }

  private async setHostMembers(
    host: Users[],
    meetingNo: number,
  ): Promise<void> {
    const hostsInfo: object[] = host.reduce((values, userNo) => {
      values.push({ meetingNo, userNo });
      return values;
    }, []);

    const saveHostsResult: number =
      await this.hostMembersRepository.saveHostMembers(hostsInfo);
    if (saveHostsResult !== host.length) {
      throw new InternalServerErrorException(
        `약속 host 데이터 추가 오류입니다`,
      );
    }
  }

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meetings> {
    try {
      const { location, time, host }: CreateMeetingDto = createMeetingDto;
      const meeting: Meetings = await this.setMeetingDetail({ location, time });
      await this.setMeetingInfo(host[0], meeting);
      await this.setHostMembers(host, meeting.no);

      return meeting;
    } catch (err) {
      throw err;
    }
  }

  async updateMeeting(
    meetingNo: number,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<void> {
    try {
      const meeting: Meetings = await this.findMeetingById(meetingNo);

      const affected: number = await this.meetingRepository.updateMeeting(
        meeting,
        updateMeetingDto,
      );
      if (!affected) {
        throw new InternalServerErrorException(`약속 수정 관련 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  async acceptMeeting(meetingNo: number): Promise<void> {
    try {
      const meeting: Meetings = await this.findMeetingById(meetingNo);
      const affected: number = await this.meetingRepository.acceptMeeting(
        meeting,
      );
      if (!affected) {
        throw new InternalServerErrorException(`약속 수락 관련 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  async findMeetingById(meetingNo: number): Promise<Meetings> {
    const meeting: Meetings = await this.meetingRepository.findMeetingById(
      meetingNo,
    );
    if (!meeting) {
      throw new NotFoundException(
        `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
      );
    }
    return meeting;
  }

  async setGuestMembers(setGuestMembersDto: SetGuestMembersDto): Promise<void> {
    const { meetingNo, guest }: SetGuestMembersDto = setGuestMembersDto;

    const meeting: Meetings = await this.findMeetingById(meetingNo);
    const affected: number = await this.meetingInfoRepository.saveMeetingGuest(
      guest[0],
      meeting,
    );
    if (!affected) {
      throw new InternalServerErrorException(
        `약속 guest 데이터 추가 오류입니다`,
      );
    }

    const guestsInfo: object[] = guest.reduce((values, userNo) => {
      values.push({ meetingNo, userNo });
      return values;
    }, []);
    const setGuestResult: number =
      await this.guestMembersRepository.saveGuestMembers(guestsInfo);
    if (setGuestResult !== guest.length) {
      throw new InternalServerErrorException(
        `약속 guest 데이터 추가 오류입니다`,
      );
    }
  }
}
