import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { MeetingRepository } from './repository/meeting.repository';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { ApplyForMeetingDto } from './dto/applyForMeeting.dto';
import { AcceptInvitaionDto } from './dto/acceptInvitation.dto';
import { AcceptMeetingDto } from './dto/acceptMeeting.dto';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { DeleteGuestDto } from 'src/meetings/dto/deleteGuest.dto';
import { DeleteHostDto } from './dto/deleteHost.dto';
import { InviteGuestDto } from './dto/inviteGuest.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import {
  ParticipatingMembers,
  MeetingDetail,
  MeetingMemberDetail,
  MeetingResponse,
  ChangeAdminGuest,
} from './interface/meeting.interface';
import { DeleteMember } from 'src/members/interface/member.interface';
import { Notice, NoticeDetail } from 'src/notices/interface/notice.interface';
import { Connection, QueryRunner } from 'typeorm';

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

    private readonly connection: Connection,
  ) {}

  private readonly member = { GUEST: 'guest', HOST: 'host' };

  private async getParticipatingMembers(
    meetingNo: number,
  ): Promise<ParticipatingMembers> {
    try {
      const participatingMembers: ParticipatingMembers =
        await this.meetingRepository.getParticipatingMembers(meetingNo);

      if (!participatingMembers.adminHost) {
        const affected: number = await this.meetingRepository.deleteMeeting(
          meetingNo,
        );
        if (!affected) {
          throw new InternalServerErrorException(`약속 삭제 오류입니다.`);
        }
        throw new BadRequestException(`삭제된 약속입니다.`);
      }

      return participatingMembers;
    } catch (err) {
      throw err;
    }
  }

  private async setMeetingDetail(
    queryRunner: QueryRunner,
    meetingDetail: MeetingDetail,
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: MeetingResponse =
        await queryRunner.manager
          .getCustomRepository(MeetingRepository)
          .createMeeting(meetingDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`약속 detail 생성 오류입니다.`);
      }

      return insertId;
    } catch (err) {
      throw err;
    }
  }

  private async setMeetingInfo(
    queryRunner: QueryRunner,
    meetingInfo: MeetingMemberDetail,
  ): Promise<void> {
    try {
      const affectedRows: number = await queryRunner.manager
        .getCustomRepository(MeetingInfoRepository)
        .createMeetingInfo(meetingInfo);

      if (!affectedRows) {
        throw new InternalServerErrorException(`meeting 생성 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async setMeetingMembers(
    members: number[],
    meetingNo: number,
    side: string,
    queryRunner: QueryRunner,
  ) {
    try {
      const memberInfo = members.reduce((values, userNo) => {
        values.push({ meetingNo, userNo });
        return values;
      }, []);

      const affectedRows: number =
        side === this.member.GUEST
          ? await queryRunner.manager
              .getCustomRepository(GuestMembersRepository)
              .saveGuestMembers(memberInfo)
          : await queryRunner.manager
              .getCustomRepository(HostMembersRepository)
              .saveHostMembers(memberInfo);

      if (affectedRows !== members.length) {
        throw new InternalServerErrorException(`약속 멤버 추가 오류입니다`);
      }
    } catch (err) {
      throw err;
    }
  }

  async createMeeting({
    location,
    time,
    host,
    guestHeadcount,
  }: CreateMeetingDto): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const meetingNo: number = await this.setMeetingDetail(queryRunner, {
        location,
        time,
      });

      const meetingInfo: MeetingMemberDetail = {
        host: host[0],
        meetingNo,
        guestHeadcount,
        hostHeadcount: host.length,
      };

      await this.setMeetingInfo(queryRunner, meetingInfo);
      await this.setMeetingMembers(
        host,
        meetingNo,
        this.member.HOST,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      return meetingNo;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
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

  private async checkIsAccepted(meetingNo: number): Promise<void> {
    try {
      const { isAccepted }: Meetings = await this.findMeetingById(meetingNo);
      if (isAccepted) {
        throw new BadRequestException(`이미 수락된 약속입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async checkUpdateAvailable(
    meetingNo: number,
    userNo: number,
  ): Promise<void> {
    try {
      await this.checkIsAccepted(meetingNo);
      const { adminHost, isDone }: ParticipatingMembers =
        await this.meetingRepository.getParticipatingMembers(meetingNo);

      if (!isDone) {
        throw new BadRequestException(`아직 게스트가 참여하지 않은 약속입니다`);
      }

      if (userNo !== adminHost) {
        throw new BadRequestException(`약속 수정 권한이 없는 유저입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async updateMeeting(
    meetingNo,
    { userNo, location, time }: UpdateMeetingDto,
  ): Promise<void> {
    try {
      await this.checkUpdateAvailable(meetingNo, userNo);

      const affected: number = await this.meetingRepository.updateMeeting(
        meetingNo,
        { location, time },
      );
      if (!affected) {
        throw new InternalServerErrorException(`약속 수정 관련 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async checkAcceptAvailable(meetingNo: number, userNo: number) {
    try {
      await this.checkIsAccepted(meetingNo);
      const { adminGuest, isDone }: ParticipatingMembers =
        await this.getParticipatingMembers(meetingNo);

      if (!isDone) {
        throw new BadRequestException(
          `게스트 참여 신청이 마감되지 않은 약속입니다`,
        );
      }
      if (userNo !== adminGuest) {
        throw new BadRequestException(`약속 수락 권한이 없는 유저입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async acceptMeeting(meetingNo: number, userNo: number): Promise<void> {
    try {
      await this.checkAcceptAvailable(meetingNo, userNo);

      const affected: number = await this.meetingRepository.acceptMeeting(
        meetingNo,
      );
      if (!affected) {
        throw new InternalServerErrorException(`약속 수락 관련 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private castMembersAsNumber(guests: string, hosts: string): number[] {
    try {
      const members: number[] = guests
        ? hosts.split(',').concat(guests.split(',')).map(Number)
        : hosts.split(',').map(Number);

      return members;
    } catch (err) {
      throw err;
    }
  }

  private checkUsersInMembers(users: number[], guests: string, hosts: string) {
    try {
      const members: number[] = this.castMembersAsNumber(guests, hosts);
      const isOverlaped: number =
        members.length + users.length - new Set([...members, ...users]).size;

      if (isOverlaped) {
        throw new BadRequestException(`이미 약속에 참여 중인 유저입니다`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async checkApplyAvailable(
    meetingNo: number,
    guest: number[],
  ): Promise<ParticipatingMembers> {
    try {
      await this.findMeetingById(meetingNo);
      const memberDetail: ParticipatingMembers =
        await this.getParticipatingMembers(meetingNo);

      const { isDone, guests, hosts }: ParticipatingMembers = memberDetail;
      if (isDone || guests) {
        throw new BadRequestException(`게스트 신청이 마감된 약속입니다.`);
      }
      this.checkUsersInMembers(guest, guests, hosts);

      return memberDetail;
    } catch (err) {
      throw err;
    }
  }

  async applyForMeeting(
    meetingNo: number,
    { guest, userNo }: ApplyForMeetingDto,
  ): Promise<void> {
    try {
      if (userNo != guest[0]) {
        throw new BadRequestException(
          `guest[0]은 요청을 보낸 유저와 동일해야 합니다.`,
        );
      }

      const { guestHeadcount, adminHost }: ParticipatingMembers =
        await this.checkApplyAvailable(meetingNo, guest);
      if (guestHeadcount != guest.length) {
        throw new BadRequestException(
          `게스트가 ${guestHeadcount}명이어야 합니다.`,
        );
      }

      const noticeDetail: NoticeDetail = {
        userNo: adminHost,
        targetUserNo: userNo,
        type: NoticeType.APPLY_FOR_MEETING,
        value: JSON.stringify({ guest, meetingNo }),
      };
      await this.setNotice(noticeDetail);
    } catch (err) {
      throw err;
    }
  }

  private async setAdminGuest(
    queryRunner: QueryRunner,
    meetingNo: number,
    guest: number,
  ): Promise<void> {
    try {
      const affected: number = await queryRunner.manager
        .getCustomRepository(MeetingInfoRepository)
        .saveMeetingGuest(guest, meetingNo);

      if (!affected) {
        throw new InternalServerErrorException(
          `약속 adimGuest 추가 오류입니다`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async acceptGuestApplication(noticeNo: number): Promise<void> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { value, userNo, type }: Notice =
        await this.noticesRepository.getNoticeById(noticeNo);

      if (type !== NoticeType.APPLY_FOR_MEETING) {
        throw new BadRequestException(`알람 type에 맞지 않는 요청 경로입니다.`);
      }

      const { guest, meetingNo } = JSON.parse(value);
      const { adminHost }: ParticipatingMembers =
        await this.checkApplyAvailable(meetingNo, guest);
      if (userNo !== adminHost) {
        throw new BadRequestException(
          `게스트 참여 요청 수락 권한이 없는 유저입니다`,
        );
      }

      await this.setAdminGuest(queryRunner, meetingNo, guest[0]);
      await this.setMeetingMembers(
        guest,
        meetingNo,
        this.member.GUEST,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMeetingMembers(meetingNo: number): Promise<number[]> {
    try {
      const { hosts, guests }: ParticipatingMembers =
        await this.getParticipatingMembers(meetingNo);
      const members: number[] = this.castMembersAsNumber(guests, hosts);

      return members;
    } catch (err) {
      throw err;
    }
  }

  private async setNotice(
    noticeDetail: NoticeDetail,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    try {
      const { affectedRows }: MeetingResponse = queryRunner
        ? await queryRunner.manager
            .getCustomRepository(NoticesRepository)
            .saveNotice(noticeDetail)
        : await this.noticesRepository.saveNotice(noticeDetail);

      if (!affectedRows) {
        throw new InternalServerErrorException(`약속 알람 생성 에러입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async checkInviteAvailable(
    userNo: number,
    meetingNo: number,
    invitedUserNo: number,
  ): Promise<number> {
    try {
      const {
        addGuestAvailable,
        addHostAvailable,
        guests,
        hosts,
      }: ParticipatingMembers = await this.getParticipatingMembers(meetingNo);
      await this.checkUsersInMembers([invitedUserNo], guests, hosts);

      if (hosts.split(',').map(Number).includes(userNo)) {
        if (!addHostAvailable) {
          throw new BadRequestException(`호스트 인원이 초과되었습니다.`);
        }

        return NoticeType.INVITE_HOST;
      } else if (guests && guests.split(',').map(Number).includes(userNo)) {
        if (!addGuestAvailable) {
          throw new BadRequestException(`게스트 인원이 초과되었습니다`);
        }

        return NoticeType.INVITE_GUEST;
      } else {
        throw new BadRequestException(
          `약속에 참여 중이지 않은 유저는 초대 요청을 보낼 수 없습니다.`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async inviteMember(
    meetingNo: number,
    { invitedUserNo, userNo }: InviteGuestDto,
  ): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);
      const noticeType: number = await this.checkInviteAvailable(
        userNo,
        meetingNo,
        invitedUserNo,
      );

      const noticeDetail: NoticeDetail = {
        userNo: invitedUserNo,
        targetUserNo: userNo,
        type: noticeType,
        value: JSON.stringify({ meetingNo }),
      };
      this.setNotice(noticeDetail);
    } catch (err) {
      throw err;
    }
  }

  private async saveInvitedMember(
    userNo: number,
    noticeType: number,
    meetingNo: number,
  ): Promise<void> {
    try {
      let affectedRows;
      if (
        noticeType !== NoticeType.INVITE_HOST &&
        noticeType !== NoticeType.INVITE_GUEST
      ) {
        throw new BadRequestException(`알람 type에 맞지 않는 요청 경로입니다.`);
      }

      const { addGuestAvailable, addHostAvailable } =
        await this.getParticipatingMembers(meetingNo);

      if (noticeType === NoticeType.INVITE_GUEST) {
        if (!addGuestAvailable) {
          throw new BadRequestException(`게스트 인원이 초과되었습니다.`);
        }
        affectedRows = await this.guestMembersRepository.saveGuestMembers([
          { userNo, meetingNo },
        ]);
      } else {
        if (!addHostAvailable) {
          throw new BadRequestException(`호스트 인원이 초과되었습니다.`);
        }
        affectedRows = await this.hostMembersRepository.saveHostMembers([
          { userNo, meetingNo },
        ]);
      }

      if (!affectedRows) {
        throw new InternalServerErrorException(`멤버 추가 관련 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async acceptInvitation(noticeNo: number, userNo: number): Promise<void> {
    try {
      const { value, type }: Notice =
        await this.noticesRepository.getNoticeById(noticeNo);
      const { meetingNo } = JSON.parse(value);

      await this.findMeetingById(meetingNo);
      await this.saveInvitedMember(userNo, type, meetingNo);
    } catch (err) {
      throw err;
    }
  }

  private detectNotInMembers(
    sameSideMembers: string,
    userNo: number,
    newAdmin: number,
  ): void {
    try {
      const members: number[] = sameSideMembers.split(',').map(Number);
      const notInMembers: number =
        new Set([...members, userNo, newAdmin]).size - members.length;

      if (notInMembers) {
        throw new BadRequestException(`약속에 참여 중인 유저가 아닙니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async detectAdminGuestChange(
    changeAdminGuest: ChangeAdminGuest,
  ): Promise<void> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userNo, adminGuest, newAdminGuest, meetingNo } = changeAdminGuest;

      if (userNo === adminGuest) {
        await this.setAdminGuest(queryRunner, meetingNo, newAdminGuest);

        const noticeDetail: NoticeDetail = {
          userNo,
          targetUserNo: newAdminGuest,
          type: NoticeType.BE_ADMIN_GUEST,
          value: JSON.stringify({ meetingNo }),
        };
        this.setNotice(noticeDetail, queryRunner);
      } else if (adminGuest !== newAdminGuest) {
        throw new BadRequestException(
          `호스트 대표가 계속 약속에 참여할 경우 새로운 대표를 설정할 수 없습니다.`,
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async deleteMember(
    deleteMember: DeleteMember,
    side: string,
  ): Promise<void> {
    try {
      const affected: number =
        side === this.member.GUEST
          ? await this.guestMembersRepository.deleteGuest(deleteMember)
          : await this.hostMembersRepository.deleteHost(deleteMember);

      if (!affected) {
        throw new InternalServerErrorException(`멤버 삭제 에러입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async deleteGuest(
    meetingNo: number,
    { userNo, newAdminGuest }: DeleteGuestDto,
  ): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);

      const { adminGuest, guests }: ParticipatingMembers =
        await this.getParticipatingMembers(meetingNo);
      if (!adminGuest) {
        throw new BadRequestException(`참여 중인 게스트가 없는 약속입니다`);
      }
      if (userNo === newAdminGuest) {
        throw new BadRequestException(`새로운 호스트 대표를 설정해 주세요.`);
      }

      this.detectNotInMembers(guests, userNo, newAdminGuest);
      await this.detectAdminGuestChange({
        meetingNo,
        userNo,
        adminGuest,
        newAdminGuest,
      });

      await this.deleteMember({ meetingNo, userNo }, this.member.GUEST);
    } catch (err) {
      throw err;
    }
  }

  async deleteHost(meetingNo: number, userNo: number): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);

      const { adminHost, hosts }: ParticipatingMembers =
        await this.getParticipatingMembers(meetingNo);
      if (userNo === adminHost) {
        const affected: number = await this.meetingRepository.deleteMeeting(
          meetingNo,
        );
        if (!affected) {
          throw new InternalServerErrorException(`호스트 삭제 에러입니다.`);
        }

        return;
      }

      this.detectNotInMembers(hosts, userNo, adminHost);
      await this.deleteMember({ meetingNo, userNo }, this.member.HOST);
    } catch (err) {
      throw err;
    }
  }
}
