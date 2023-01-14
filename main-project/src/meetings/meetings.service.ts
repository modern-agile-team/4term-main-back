import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MeetingRepository } from './repository/meeting.repository';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import {
  InsertRaw,
  Meeting,
  MeetingGuests,
  MeetingHosts,
} from './interface/meeting.interface';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly chacListRepository: ChatListRepository,
    private readonly chatUserRepository: ChatUsersRepository,
  ) {}

  async createMeeting(
    createMeetingDto: CreateMeetingDto,
    userNo: number,
  ): Promise<number> {
    const { chatRoomNo }: CreateMeetingDto = createMeetingDto;
    await this.validateUserInChatRoom(userNo, chatRoomNo);
    await this.validateMeetingNotExist(chatRoomNo);

    return await this.saveMeeting(createMeetingDto);
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

  private async saveMeeting(meeting: Meeting): Promise<number> {
    const { insertId }: InsertRaw = await this.meetingRepository.createMeeting(
      meeting,
    );
    if (!insertId) {
      throw new InternalServerErrorException(
        `약속 생성(createMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  private async validateUserInChatRoom(
    userNo: number,
    chatRoomNo: number,
  ): Promise<void> {
    const { users } = await this.chatUserRepository.getChatRoomUsers(
      chatRoomNo,
    );

    if (!users) {
      throw new NotFoundException('존재하지 않는 채팅방입니다');
    }
    if (!JSON.parse(users).includes(userNo)) {
      throw new BadRequestException('채팅방에 참여 중인 유저가 아닙니다.');
    }
  }

  private async validateMeetingNotExist(chatRoomNo: number): Promise<void> {
    const meeting: Meetings =
      await this.meetingRepository.findMeetingByChatRoom(chatRoomNo);

    if (meeting) {
      throw new BadRequestException('이미 약속이 있는 채팅방입니다.');
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
