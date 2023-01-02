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
  MeetingGuests,
  MeetingHosts,
} from './interface/meeting.interface';
import { Connection, QueryRunner } from 'typeorm';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatList } from 'src/chats/entity/chat-list.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(ChatListRepository)
    private readonly chacListRepository: ChatListRepository,
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
    await this.validateHostAuthority(meetingNo, userNo);

    await this.meetingRepository.deleteMeeting(meetingNo);
  }

  async updateMeeting(
    meetingNo,
    { userNo, time, location }: UpdateMeetingDto,
  ): Promise<void> {
    await this.validateHostAuthority(meetingNo, userNo);

    const affected: number = await this.meetingRepository.updateMeeting(
      meetingNo,
      { time, location },
    );

    if (!affected) {
      throw new InternalServerErrorException(`약속 수정 관련 오류입니다.`);
    }
  }

  async acceptMeeting(meetingNo: number, userNo: number): Promise<void> {
    await this.checkIsAccepted(meetingNo);
    await this.validateGuestAuthority(meetingNo, userNo);

    const affected: number = await this.meetingRepository.acceptMeeting(
      meetingNo,
    );

    if (!affected) {
      throw new InternalServerErrorException(`약속 수락 관련 오류입니다.`);
    }
  }

  private async validateChatRoom(chatRoomNo: number): Promise<void> {
    const chatRoom: ChatList =
      await this.chacListRepository.checkRoomExistsByChatRoomNo(chatRoomNo);

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

  private async validateHostAuthority(meetingNo: number, userNo: number) {
    const { hosts }: MeetingHosts =
      await this.meetingRepository.getMeetingHosts(meetingNo);

    const haveAuthority = JSON.parse(hosts).includes(userNo);

    if (!haveAuthority) {
      throw new BadRequestException(`호스트가 아닌 유저입니다.`);
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
    const { isAccepted }: Meetings = await this.findMeetingById(meetingNo);

    if (isAccepted) {
      throw new BadRequestException(`이미 수락된 약속입니다.`);
    }
  }

  private async validateGuestAuthority(meetingNo: number, userNo: number) {
    const { guests }: MeetingGuests =
      await this.meetingRepository.getMeetingGuests(meetingNo);

    const haveAuthority = JSON.parse(guests).includes(userNo);

    if (!haveAuthority) {
      throw new BadRequestException(`게스트가 아닌 유저입니다.`);
    }
  }
}
