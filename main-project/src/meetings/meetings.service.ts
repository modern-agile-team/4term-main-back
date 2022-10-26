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
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { DeleteGuestDto } from 'src/meetings/dto/deleteGuest.dto';
import { InviteMemberDto } from './dto/inviteMember.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import {
  InsertRaw,
  MeetingDetail,
  MeetingMemberDetail,
  MeetingVacancy,
  Members,
  NoticeGuestParam,
  NoticeMeetingParam,
} from './interface/meeting.interface';
import { DeleteMember } from 'src/members/interface/member.interface';
import {
  Notice,
  NoticeDetail,
  NoticeGuestDetail,
  NoticeGuests,
  NoticeMeeting,
} from 'src/notices/interface/notice.interface';
import { Connection, QueryRunner } from 'typeorm';
import { MeetingInfo } from './interface/meeting-info.interface';
import { NoticeGuestsRepository } from 'src/notices/repository/notices-guests.repository';
import { NoticeMeetingsRepository } from 'src/notices/repository/notices-meetings.repository';

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

    @InjectRepository(NoticeGuestsRepository)
    private readonly noticeGuestsRepository: NoticeGuestsRepository,

    private readonly connection: Connection,
  ) {}

  private readonly member = { GUEST: 'guest', HOST: 'host' };

  async deleteMeeting(meetingNo: number): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);
      const affected = await this.meetingRepository.deleteMeeting(meetingNo);

      if (!affected) {
        throw new BadRequestException(`약속 삭제 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  private async setMeetingDetail(
    queryRunner: QueryRunner,
    meetingDetail: MeetingDetail,
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: InsertRaw = await queryRunner.manager
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
  ): Promise<void> {
    try {
      const memberInfo: object[] = members.reduce((values, userNo) => {
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
    let queryRunner: QueryRunner;

    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

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

  private async isAuthorized(meetingNo: number, userNo: number): Promise<any> {
    try {
      const { adminHost, adminGuest }: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

      if (userNo === adminGuest || userNo === adminHost) {
        return userNo === adminGuest ? this.member.GUEST : this.member.HOST;
      }

      return 0;
    } catch (err) {
      throw err;
    }
  }

  async updateMeeting(
    meetingNo,
    { userNo, location, time }: UpdateMeetingDto,
  ): Promise<void> {
    try {
      await this.checkIsAccepted(meetingNo);
      const authority: any = await this.isAuthorized(meetingNo, userNo);

      if (authority !== this.member.HOST) {
        throw new BadRequestException(`약속 수정 권한이 없는 유저입니다.`);
      }

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

  async acceptMeeting(meetingNo: number, userNo: number): Promise<void> {
    try {
      await this.checkIsAccepted(meetingNo);
      const authority: any = await this.isAuthorized(meetingNo, userNo);

      if (authority !== this.member.GUEST) {
        throw new BadRequestException(`약속 수락 권한이 없는 유저입니다.`);
      }

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

  private async checkUsersInMeeting(
    users: number[],
    meetingNo: number,
  ): Promise<void> {
    try {
      const members: number[] = await this.getMeetingMembers(meetingNo);
      const isOverlaped: number =
        members.length + users.length - new Set([...members, ...users]).size;

      if (isOverlaped) {
        throw new BadRequestException(
          `이미 약속에 참여 중인 유저가 존재합니다.`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  private async checkApplyAvailable(
    meetingNo: number,
    guest: number[],
  ): Promise<number> {
    try {
      const { adminGuest, adminHost, guestHeadcount }: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

      if (adminGuest) {
        throw new BadRequestException(`이미 게스트가 참여 중인 약속입니다.`);
      }

      if (guest.length !== guestHeadcount) {
        throw new BadRequestException(
          `게스트가 ${guestHeadcount}명이어야 합니다.`,
        );
      }

      return adminHost;
    } catch (err) {
      throw err;
    }
  }

  private async isApplicationExist(
    userNo: number,
    meetingNo: number,
  ): Promise<number> {
    try {
      const notice: Notice = await this.noticesRepository.getApplication({
        meetingNo,
        userNo,
      });

      if (!notice) {
        return 0;
      }

      return notice.noticeNo;
    } catch (err) {
      throw err;
    }
  }

  private async setNoticeGuests({
    noticeNo,
    guest,
    queryRunner,
  }: NoticeGuestParam): Promise<void> {
    try {
      const guestDetails: NoticeGuestDetail[] = guest.reduce(
        (values, userNo) => {
          values.push({ noticeNo, userNo });
          return values;
        },
        [],
      );

      const { affectedRows }: InsertRaw = await queryRunner.manager
        .getCustomRepository(NoticeGuestsRepository)
        .saveNoticeGuest(guestDetails);
      if (affectedRows !== guest.length) {
        throw new InternalServerErrorException(
          `게스트 신청 알림 추가(setNoticeGuests): 알 수 없는 서버 에러입니다.`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  private async setNoticeMeeting({
    noticeNo,
    meetingNo,
    queryRunner,
  }: NoticeMeetingParam): Promise<void> {
    try {
      const { affectedRows }: InsertRaw = await queryRunner.manager
        .getCustomRepository(NoticeMeetingsRepository)
        .saveNoticeMeeting({ noticeNo, meetingNo });

      if (!affectedRows) {
        throw new InternalServerErrorException(
          `알림 약속 번호 저장(setNoticeMeetings): 알 수 없는 서버 에러입니다.`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async applyForMeeting(
    meetingNo: number,
    { guest, userNo }: ApplyForMeetingDto,
  ): Promise<void> {
    let queryRunner: QueryRunner;
    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      guest = Array.from(new Set(guest));
      if (!guest.includes(userNo)) {
        guest.push(userNo);
      }

      await this.findMeetingById(meetingNo);
      await this.checkUsersInMeeting(guest, meetingNo);

      const adminHost: number = await this.checkApplyAvailable(
        meetingNo,
        guest,
      );

      const isApplicationExist: number = await this.isApplicationExist(
        userNo,
        meetingNo,
      );
      if (isApplicationExist) {
        throw new BadRequestException(`이미 신청을 보낸 약속입니다.`);
      }

      const noticeDetail: NoticeDetail = {
        userNo: adminHost,
        targetUserNo: userNo,
        type: NoticeType.APPLY_FOR_MEETING,
      };
      const noticeNo: number = await this.setNotice(noticeDetail, queryRunner);
      await this.setNoticeGuests({ noticeNo, guest, queryRunner });
      await this.setNoticeMeeting({ noticeNo, meetingNo, queryRunner });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async retractApplication(meetingNo: number, userNo) {
    try {
      await this.findMeetingById(meetingNo);
      const { adminGuest }: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);
      if (adminGuest === userNo) {
        throw new BadRequestException(
          `이미 수락된 약속 요청은 취소할 수 없습니다.`,
        );
      }

      const noticeNo: number = await this.isApplicationExist(userNo, meetingNo);
      if (!noticeNo) {
        throw new BadRequestException(`취소할 신청이 없습니다.`);
      }

      const affected: number = await this.noticesRepository.deleteNotice(
        noticeNo,
      );
      if (!affected) {
        throw new InternalServerErrorException(
          `약속 신청 취소(retractApplication): 알 수 없는 서버 오류입니다.`,
        );
      }
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
          `약속 adimGuest 설정 오류입니다`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  private async findNoticeById(noticeNo: number): Promise<Notice> {
    try {
      const notice: Notice = await this.noticesRepository.getNoticeById(
        noticeNo,
      );
      if (!notice) {
        throw new BadRequestException(`존재하지 않는 알림입니다.`);
      }

      return notice;
    } catch (err) {
      throw err;
    }
  }

  private async findNoticeGuests(noticeNo: number): Promise<NoticeGuests> {
    try {
      let notice: NoticeGuests =
        await this.noticesRepository.getApplicationGuests(noticeNo);
      if (!notice) {
        throw new BadRequestException(`조건에 맞는 알림이 존재하지 않습니다.`);
      }
      notice.guests = JSON.parse(notice.guests);

      return notice;
    } catch (err) {
      throw err;
    }
  }

  private async findNoticeMeeting(
    userNo: number,
    noticeNo: number,
  ): Promise<NoticeMeeting> {
    try {
      const noticeMeeting: NoticeMeeting =
        await this.noticesRepository.getNoticeInvitation(userNo, noticeNo);
      if (!noticeMeeting) {
        throw new BadRequestException(`조건에 맞는 알림이 존재하지 않습니다.`);
      }

      return noticeMeeting;
    } catch (err) {
      throw err;
    }
  }

  async acceptGuests(noticeNo: number, userNo: number): Promise<void> {
    let queryRunner: QueryRunner;
    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { guests, adminGuest, meetingNo }: NoticeGuests =
        await this.findNoticeGuests(noticeNo);

      await this.checkUsersInMeeting(guests, meetingNo);
      const adminHost: number = await this.checkApplyAvailable(
        meetingNo,
        guests,
      );
      if (adminHost !== userNo) {
        throw new BadRequestException(`게스트 수락 권한이 없는 유저입니다.`);
      }

      await this.setAdminGuest(queryRunner, meetingNo, adminGuest);
      await this.setMeetingMembers(
        guests,
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
      const { members }: Members =
        await this.meetingRepository.getMeetingMembers(meetingNo);

      return members.split(',').map(Number);
    } catch (err) {
      throw err;
    }
  }

  private async setNotice(
    noticeDetail: NoticeDetail,
    queryRunner?: QueryRunner,
  ): Promise<number> {
    try {
      const { affectedRows, insertId }: InsertRaw = await queryRunner.manager
        .getCustomRepository(NoticesRepository)
        .saveNotice(noticeDetail);

      if (!affectedRows) {
        throw new InternalServerErrorException(`약속 알림 생성 에러입니다.`);
      }

      return insertId;
    } catch (err) {
      throw err;
    }
  }

  private async checkInviteAvailable(
    meetingNo: number,
    userNo: number,
    invitedUserNo: number,
    noticeType: number,
  ) {
    try {
      const members: number[] = await this.getMeetingMembers(meetingNo);
      if (members.includes(invitedUserNo)) {
        throw new BadRequestException(`이미 약속에 참여 중인 유저입니다.`);
      }
      if (!members.includes(userNo)) {
        throw new BadRequestException(
          `초대를 보낸 유저가 약속에 참여하고 있지 않습니다`,
        );
      }

      const { addHostAvailable, addGuestAvailable }: MeetingVacancy =
        await this.meetingRepository.getMeetingVacancy(meetingNo);

      if (
        (noticeType === NoticeType.INVITE_HOST && !addHostAvailable) ||
        (noticeType === NoticeType.INVITE_GUEST && !addGuestAvailable)
      ) {
        throw new BadRequestException(
          `공석이 없는 약속에는 유저를 추가할 수 없습니다.`,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async inviteMember(
    meetingNo: number,
    { invitedUserNo, userNo }: InviteMemberDto,
    noticeType: number,
  ): Promise<void> {
    let queryRunner: QueryRunner;
    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.findMeetingById(meetingNo);

      await this.checkInviteAvailable(
        meetingNo,
        userNo,
        invitedUserNo,
        noticeType,
      );

      const noticeDetail: NoticeDetail = {
        userNo: invitedUserNo,
        targetUserNo: userNo,
        type: noticeType,
      };
      const noticeNo = await this.setNotice(noticeDetail, queryRunner);
      await this.setNoticeMeeting({ noticeNo, meetingNo, queryRunner });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveInvitedMember(
    noticeType: number,
    savedMember: object[],
  ): Promise<void> {
    try {
      const affectedRows: number =
        noticeType === NoticeType.INVITE_GUEST
          ? await this.guestMembersRepository.saveGuestMembers(savedMember)
          : await this.hostMembersRepository.saveHostMembers(savedMember);

      if (!affectedRows) {
        throw new InternalServerErrorException(`멤버 추가 관련 오류입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async acceptInvitation(userNo: number, noticeNo: number): Promise<void> {
    try {
      const { targetUserNo, meetingNo, type }: NoticeMeeting =
        await this.findNoticeMeeting(userNo, noticeNo);

      await this.findMeetingById(meetingNo);
      await this.checkInviteAvailable(meetingNo, targetUserNo, userNo, type);
      await this.saveInvitedMember(type, [{ userNo, meetingNo }]);
    } catch (err) {
      throw err;
    }
  }

  private async IsMeetingGuest(
    meetingNo: number,
    users: number[],
  ): Promise<number> {
    try {
      users = Array.from(new Set(users));
      let guests: any = await this.guestMembersRepository.getMeetingGuest(
        meetingNo,
      );
      guests = guests.split(',').map(Number);

      if (new Set([...guests, ...users]).size > guests.length) {
        throw new BadRequestException(`약속에 참여 중인 게스트가 아닙니다.`);
      }

      return guests.length;
    } catch (err) {
      throw err;
    }
  }

  private async IsMeetingHost(meetingNo: number, user: number) {
    try {
      let hosts: any = await this.hostMembersRepository.getMeetingHost(
        meetingNo,
      );
      hosts = hosts.split(',').map(Number);

      if (new Set([...hosts, user]).size > hosts.length) {
        throw new BadRequestException(`약속에 참여 중인 호스트가 아닙니다.`);
      }
    } catch (err) {
      throw err;
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
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.findMeetingById(meetingNo);

      const { adminGuest }: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

      const guestCount: number = await this.IsMeetingGuest(meetingNo, [
        userNo,
        newAdminGuest,
      ]);
      if (guestCount === 1) {
        await this.deleteMeeting(meetingNo);
        return;
      }

      if (userNo === adminGuest) {
        if (adminGuest === newAdminGuest) {
          throw new BadRequestException(
            `새로운 호스트 대표 설정이 필요합니다.`,
          );
        }

        this.setAdminGuest(queryRunner, meetingNo, newAdminGuest);
      }

      await this.deleteMember({ meetingNo, userNo }, this.member.GUEST);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteHost(meetingNo: number, userNo: number): Promise<void> {
    try {
      await this.findMeetingById(meetingNo);

      const { adminHost }: MeetingInfo =
        await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

      if (userNo !== adminHost) {
        await this.IsMeetingHost(meetingNo, userNo);
        await this.deleteMember({ meetingNo, userNo }, this.member.HOST);
      } else {
        await this.deleteMeeting(meetingNo);
        return;
      }
    } catch (err) {
      throw err;
    }
  }
}
