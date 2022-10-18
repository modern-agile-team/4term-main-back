import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChat } from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';

// 1채팅방 방장 이름 있어야함
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,
  ) {}

  async createRoom(socket, roomName, userNo, meetingNo) {
    try {
      const roomExist = await this.chatListRepository.checkRoomExist(roomName);
      console.log(3);

      if (!roomExist) {
        socket.join(roomName);
        await this.createRoomByMeetingNo({ meetingNo, roomName, userNo });
      }
    } catch (err) {
      throw err;
    }
  }
  private async getUserNicknameByMeetingNo(meetingNo) {
    try {
      await this.chatListRepository.getUserNickname(meetingNo);
    } catch (err) {}
  }
  private async createRoomByMeetingNo(createChat: CreateChat) {
    try {
      await this.chatListRepository.createRoom(createChat);
    } catch (err) {
      console.log(err);
    }
  }
}
