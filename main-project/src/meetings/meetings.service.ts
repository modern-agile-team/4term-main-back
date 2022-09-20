import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRepository } from './repository/meeting.repository';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { SetGuestMembersDto } from 'src/members/dto/setGuestMembers.dto';
import { DeleteGeustDto } from 'src/members/dto/deleteGuest.dto';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Notices } from 'src/notices/entity/notices.entity';
import { Meetings } from './entity/meeting.entity';
import {
  ParticipatingMembers,
  MeetingDetail,
  MeetingMemberDetail,
  MeetingResponse,
} from './interface/meeting.interface';
import { Users } from 'src/users/entity/user.entity';
import { NOTICE_TYPE } from 'src/common/configs/notice-type.config';

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
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: MeetingResponse =
        await this.meetingRepository.createMeeting(meetingDetail);
      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
      }

      return insertId;
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

  private async setAdminGuest(meetingNo: number, guest: number): Promise<void> {
    try {
      const meeting: Meetings = await this.findMeetingById(meetingNo);
      const { adminGuest } =
        await this.meetingRepository.getParticipatingMembers(meetingNo);
      if (adminGuest) {
        throw new BadRequestException(
          `마감된 약속에는 게스트를 추가할 수 없습니다.`,
        );
      }

      const affected: number =
        await this.meetingInfoRepository.saveMeetingGuest(guest, meeting);
      if (!affected) {
        throw new InternalServerErrorException(
          `약속 adimGuest 추가 오류입니다`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  private async setHostMembers(
    host: number[],
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

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<number> {
    try {
      const { location, time, host, guestHeadcount }: CreateMeetingDto =
        createMeetingDto;
      const meetingNo: number = await this.setMeetingDetail({ location, time });

      const meetingInfo: MeetingMemberDetail = {
        host: host[0], //후에 토큰 유저넘버로 변경
        meetingNo,
        guestHeadcount,
        hostHeadcount: host.length,
      };
      await this.setMeetingInfo(meetingInfo);
      await this.setHostMembers(host, meetingNo);

      return meetingNo;
    } catch (err) {
      throw err;
    }
  }

  private async setGuestMembers(
    guest: number[],
    meetingNo: number,
  ): Promise<void> {
    try {
      const guestInfo: object[] = guest.reduce((values, userNo) => {
        values.push({ meetingNo, userNo });
        return values;
      }, []);

      const saveGuestsResult: number =
        await this.guestMembersRepository.saveGuestMembers(guestInfo);
      if (saveGuestsResult !== guest.length) {
        throw new InternalServerErrorException(
          `약속 guest member 추가 오류입니다`,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async castMembersAsNumber(guests: string, hosts: string): Promise<number[]> {
    const members: number[] = guests
      ? hosts.split(',').concat(guests.split(',')).map(Number)
      : hosts.split(',').map(Number);

    return members;
  }

  async getMeetingMembers(meetingNo): Promise<number[]> {
    try {
      const { hosts, guests }: ParticipatingMembers =
        await this.meetingRepository.getParticipatingMembers(meetingNo);
      const members: number[] = await this.castMembersAsNumber(guests, hosts);

      return members;
    } catch (err) {
      throw err;
    }
  }

  private async checkUsersInMembers(
    users: number[],
    guests: string,
    hosts: string,
  ) {
    try {
      const members: number[] = await this.castMembersAsNumber(guests, hosts);
      const isOverlaped =
        members.length + users.length - new Set([...members, ...users]).size;

      if (isOverlaped) {
        throw new BadRequestException(`이미 약속에 참여 중인 유저입니다`);
      }
    } catch (err) {
      throw err;
    }
  }

  async applyForMeeting({
    meetingNo,
    guest,
  }: SetGuestMembersDto): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);
      const { adminHost, guestHeadcount, hosts, guests }: ParticipatingMembers =
        await this.meetingRepository.getParticipatingMembers(meetingNo);
      if (guests != null) {
        throw new BadRequestException(
          `마감된 약속에는 게스트를 추가할 수 없습니다.`,
        );
      }
      if (guestHeadcount != guest.length) {
        throw new BadRequestException(
          `게스트가 ${guestHeadcount}명 필요합니다`,
        );
      }
      await this.checkUsersInMembers(guest, guests, hosts);

      await this.setNotice(
        adminHost,
        guest[0],
        NOTICE_TYPE.meeting.apply,
        JSON.stringify({ guest, meetingNo }),
      );
    } catch (error) {
      throw error;
    }
  }

  private async setNotice(
    userNo: number | Users,
    targetUserNo: number,
    type: number,
    value: string,
  ): Promise<void> {
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
    try {
      const meeting: Meetings = await this.meetingRepository.findMeetingById(
        meetingNo,
      );
      if (!meeting) {
        throw new NotFoundException(
          `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
        );
      }
      return meeting;
    } catch (err) {
      throw err;
    }
  }

  async acceptMeetingGuest(noticeNo: number): Promise<void> {
    try {
      const notice: Notices = await this.noticesRepository.getNoticeById(
        noticeNo,
      );
      const { guest, meetingNo } = JSON.parse(notice.value);

      await this.setAdminGuest(meetingNo, guest[0]);
      await this.setGuestMembers(guest, meetingNo);
    } catch (error) {
      throw error;
    }
  }

  async inviteGuest(
    meetingNo: number,
    guestUserNo: number,
    userNo: number,
  ): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);
      const { addGuestAvailable, guests, hosts }: ParticipatingMembers =
        await this.meetingRepository.getParticipatingMembers(meetingNo);
      if (!parseInt(addGuestAvailable)) {
        throw new BadRequestException(`게스트 최대 인원을 초과했습니다.`);
      }
      await this.checkUsersInMembers([guestUserNo], guests, hosts);

      this.setNotice(
        guestUserNo,
        userNo,
        NOTICE_TYPE.member.inviteGuest,
        JSON.stringify({ meetingNo }),
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteGuest(deleteGuestDto: DeleteGeustDto) {}
}
