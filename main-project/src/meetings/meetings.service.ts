import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRepository } from './repository/meeting.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import {
  InsertRaw,
  MeetingHosts,
  MeetingMemberDetail,
} from './interface/meeting.interface';
import { Connection, QueryRunner } from 'typeorm';
import { MeetingInfo } from './interface/meeting-info.interface';
import { throws } from 'assert';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatList } from 'src/chats/entity/chat-list.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(NoticesRepository)
    private readonly noticesRepository: NoticesRepository,

    @InjectRepository(ChatListRepository)
    private readonly chacListRepository: ChatListRepository,

    private readonly connection: Connection,
  ) {}

  async createMeeting(createMeetingDto: CreateMeetingDto): Promise<number> {
    const { chatRoomNo }: CreateMeetingDto = createMeetingDto;
    await this.validateChatRoom(chatRoomNo);
    await this.validateMeetingNotExist(chatRoomNo);

    const { insertId }: InsertRaw = await this.meetingRepository.createMeeting(
      createMeetingDto,
    );

    if (!insertId) {
      throw new InternalServerErrorException(
        `약속 생성 에러(createMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  async deleteMeeting(meetingNo: number, userNo: number): Promise<void> {
    await this.findMeetingById(meetingNo);
    await this.validateDeleteAuthority(meetingNo, userNo);

    await this.meetingRepository.deleteMeeting(meetingNo);
  }

  private async validateChatRoom(chatRoomNo: number): Promise<void> {
    const chatRoom: ChatList =
      await this.chacListRepository.checkRoomExistByChatNo(chatRoomNo);

    if (!chatRoom) {
      throw new NotFoundException(
        `${chatRoomNo}에 해당하는 채팅방이 존재하지 않습니다.`,
      );
    }
  }

  private async validateMeetingNotExist(chatRoomNo: number): Promise<void> {
    const meeting = await this.meetingRepository.findMeetingByChatRoom(
      chatRoomNo,
    );

    if (meeting) {
      throw new BadRequestException(`이미 약속이 있는 채팅방입니다.`);
    }
  }

  private async validateDeleteAuthority(meetingNo: number, userNo: number) {
    const { hosts }: MeetingHosts =
      await this.meetingRepository.getMeetingHosts(meetingNo);

    const haveDeleteAuthority = JSON.parse(hosts).includes(userNo);

    if (!haveDeleteAuthority) {
      throw new BadRequestException(`약속 삭제 권한이 없는 유저입니다.`);
    }
  }

  private async setMeetingDetail(
    queryRunner: QueryRunner,
    meetingDetail,
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

  // private async isAuthorized(meetingNo: number, userNo: number): Promise<any> {
  //   try {
  //     const { adminHost, adminGuest }: MeetingInfo =
  //       await this.meetingInfoRepository.getMeetingInfoById(meetingNo);

  //     if (userNo === adminGuest || userNo === adminHost) {
  //       return userNo === adminGuest ? this.member.GUEST : this.member.HOST;
  //     }

  //     return 0;
  //   } catch (err) {
  //     throw err;
  //   }
  // }

  async updateMeeting(
    meetingNo,
    { userNo, location, time }: UpdateMeetingDto,
  ): Promise<void> {
    // try {
    //   await this.checkIsAccepted(meetingNo);
    //   const authority: any = await this.isAuthorized(meetingNo, userNo);
    //   if (authority !== this.member.HOST) {
    //     throw new BadRequestException(`약속 수정 권한이 없는 유저입니다.`);
    //   }
    //   const affected: number = await this.meetingRepository.updateMeeting(
    //     meetingNo,
    //     { location, time },
    //   );
    //   if (!affected) {
    //     throw new InternalServerErrorException(`약속 수정 관련 오류입니다.`);
    //   }
    // } catch (err) {
    //   throw err;
    // }
  }

  async acceptMeeting(meetingNo: number, userNo: number): Promise<void> {
    // try {
    //   await this.checkIsAccepted(meetingNo);
    //   const authority: any = await this.isAuthorized(meetingNo, userNo);
    //   if (authority !== this.member.GUEST) {
    //     throw new BadRequestException(`약속 수락 권한이 없는 유저입니다.`);
    //   }
    //   const affected: number = await this.meetingRepository.acceptMeeting(
    //     meetingNo,
    //   );
    //   if (!affected) {
    //     throw new InternalServerErrorException(`약속 수락 관련 오류입니다.`);
    //   }
    // } catch (err) {
    //   throw err;
    // }
  }
}
