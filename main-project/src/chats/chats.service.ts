import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { ChatRoom, CreateChat } from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,

    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,
  ) {}
  async createRoom(socket, chat: CreateChat) {
    try {
      const { userNo, meetingNo } = chat;

      const meetingExist = await this.meetingRepository.findMeetingById(
        meetingNo,
      );
      if (!meetingExist) {
        throw new NotFoundException(
          `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
        );
      }

      const roomExist = await this.chatListRepository.checkRoomExist(meetingNo);
      if (roomExist) {
        throw new BadRequestException('이미 생성된 채팅방 입니다.');
      }

      if (meetingExist && !roomExist) {
        const { roomName } = await this.getUserNicknameByMeetingNo(meetingNo);
        if (!roomName) {
          throw new NotFoundException('Meeting 정보 조회 오류입니다.');
        }
        console.log(roomName);

        const result = await this.createRoomByMeetingNo({
          userNo,
          meetingNo,
          roomName,
        });
        if (!result) {
          throw new BadRequestException('채팅방 생성 오류입니다.');
        }
        socket.join(roomName);
      }
    } catch (err) {
      throw err;
    }
  }

  private async getUserNicknameByMeetingNo(meetingNo): Promise<ChatRoom> {
    try {
      const chatRoom: ChatRoom =
        await this.meetingInfoRepository.getMeetingUserNickname(meetingNo);
      chatRoom.roomName =
        chatRoom.guestUserNickname + ',' + chatRoom.hostUserNickname;
      console.log(chatRoom);

      return chatRoom;
    } catch (err) {
      throw err;
    }
  }

  private async createRoomByMeetingNo(createChat: CreateChat) {
    try {
      const raw = await this.chatListRepository.createRoom(createChat);
      return raw.affectedRows;
    } catch (err) {
      throw err;
    }
  }
}
