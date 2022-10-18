import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChat } from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,
  ) {}
  async createRoom(socket, chat: CreateChat) {
    try {
      const { roomName, userNo, meetingNo } = chat;

      await this.getUserNicknameByMeetingNo(meetingNo);

      // const roomExist = await this.chatListRepository.checkRoomExist(roomName);
      // if (roomExist) {
      //   socket.join(roomName);

      //   return {
      //     success: true,
      //   };
      // }

      // const result = await this.createRoomByMeetingNo({
      //   meetingNo,
      //   roomName,
      //   userNo,
      // });
      // if (!result) {
      //   throw new BadRequestException('채팅상 생성 오류입니다.');
      // }

      // socket.join(roomName);
    } catch (err) {
      throw err;
    }
  }

  private async getUserNicknameByMeetingNo(meetingNo) {
    try {
      const a = await this.chatListRepository.getUserNickname(meetingNo);
      console.log(a);
    } catch (err) {
      console.log(err);
    }
  }

  private async createRoomByMeetingNo(createChat: CreateChat) {
    try {
      const raw = await this.chatListRepository.createRoom(createChat);
      return raw.affectedRows;
    } catch (err) {
      console.log(err);
    }
  }
}
