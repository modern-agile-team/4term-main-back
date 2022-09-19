import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteGeustDto } from 'src/members/dto/deleteGuest.dto';
import { SetGuestMembersDto } from 'src/members/dto/setGuestMembers.dto';
import { UserNo } from 'src/members/interface/member.interface';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { Notices } from 'src/notices/entity/notices.entity';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Users } from 'src/users/entity/user.entity';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { MeetingInfo } from './entity/meeting-info.entity';
import { Meetings } from './entity/meeting.entity';
import {
  MeetingDetail,
  MeetingMemberDetail,
  MeetingResponse,
} from './interface/meeting.interface';
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

    @InjectRepository(NoticesRepository)
    private readonly noticesRepository: NoticesRepository,
  ) {}

  private async setMeetingDetail(
    meetingDetail: MeetingDetail,
  ): Promise<Meetings> {
    try {
      const { affectedRows, insertId }: MeetingResponse =
        await this.meetingRepository.createMeeting(meetingDetail);
      if (!affectedRows) {
        throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
      }
      const meeting: Meetings = await this.findMeetingById(insertId);

      return meeting;
    } catch (error) {
      throw error;
    }
  }

  private async setMeetingInfo(
    meetingInfo: MeetingMemberDetail,
  ): Promise<void> {
    try {
      const setMeetingInfoResult: number =
        await this.meetingInfoRepository.createMeetingInfo(meetingInfo);
      if (!setMeetingInfoResult) {
        throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }

  private async setHostMembers(
    host: Users[],
    meetingNo: number,
  ): Promise<void> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  private async checkGuestMember(
    guest: number[],
    meetingNo: number,
  ): Promise<void> {
    try {
      const host: UserNo[] =
        await this.hostMembersRepository.getHostByMeetingNo(meetingNo);
      host.forEach((host) => {
        if (guest.includes(host.no)) {
          throw new BadRequestException(`이미 약속에 참여 중인 유저입니다.`);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  private async checkMeetingApplyAvailable(
    meetingNo: number,
  ): Promise<MeetingInfo> {
    try {
      const meetingInfo: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

      if (meetingInfo.guest) {
        throw new BadRequestException(
          `마감된 약속에는 게스트를 추가할 수 없습니다.`,
        );
      }

      return meetingInfo;
    } catch (error) {
      throw error;
    }
  }

  private async checkGuestConflict(
    guest: number[],
    meetingNo: number,
  ): Promise<MeetingInfo> {
    try {
      const meetingInfo: MeetingInfo = await this.checkMeetingApplyAvailable(
        meetingNo,
      );
      if (guest.length != meetingInfo.guestHeadcount) {
        throw new BadRequestException(
          `게스트가 ${meetingInfo.guestHeadcount}명 필요합니다.`,
        );
      }
      await this.checkGuestMember(guest, meetingNo);

      return meetingInfo;
    } catch (error) {
      throw error;
    }
  }

  private async setNotice(userNo, targetUserNo, type, value): Promise<void> {
    value = JSON.stringify(value);
    const { affectedRows }: MeetingResponse =
      await this.noticesRepository.saveNotice({
        userNo,
        targetUserNo,
        type,
        value,
      });

    if (!affectedRows) {
      throw new InternalServerErrorException(`약속 알람 생성 에러입니다.`);
    }
  }

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<Meetings> {
    try {
      const { location, time, host, guestHeadcount }: CreateMeetingDto =
        createMeetingDto;
      const meeting: Meetings = await this.setMeetingDetail({ location, time });

      const meetingInfo: MeetingMemberDetail = {
        host: host[0],
        meeting,
        guestHeadcount,
        hostHeadcount: host.length,
      };
      await this.setMeetingInfo(meetingInfo);
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
      if (meeting.isAccepted) {
        throw new BadRequestException(`이미 수락된 약속은 수정할 수 없습니다`);
      }

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

  async applyForMeeting({
    meetingNo,
    guest,
  }: SetGuestMembersDto): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);
      const { host }: MeetingInfo = await this.checkGuestConflict(
        guest,
        meetingNo,
      );

      await this.setNotice(host, guest[0], 1, { guest, meetingNo });
    } catch (error) {
      throw error;
    }
  }

  async acceptMeetingGuest(noticeNo) {
    try {
      const notice: Notices = await this.noticesRepository.getNoticeById(
        noticeNo,
      );
      const { guest, meetingNo } = JSON.parse(notice.value);

      const meeting: Meetings = await this.findMeetingById(meetingNo);
      const affected: number =
        await this.meetingInfoRepository.saveMeetingGuest(guest[0], meeting);
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
    } catch (error) {
      throw error;
    }
  }

  async deleteGuest(deleteGuestDto: DeleteGeustDto) {}
}
