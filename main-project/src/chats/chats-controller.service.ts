import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatRoomList,
  ChatUserInfo,
  PreviousChatLog,
} from './interface/chat.interface';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsControllerService {
  constructor(
    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(ChatLogRepository)
    private readonly chatLogRepository: ChatLogRepository,
  ) {}

  async getChatRoomListByUserNo(userNo): Promise<ChatRoomList[]> {
    try {
      const chatList: ChatRoomList[] =
        await this.chatUsersRepository.getChatRoomList(userNo);
      if (!chatList.length) {
        throw new BadRequestException('채팅방이 존재하지 않습니다.');
      }

      return chatList;
    } catch (err) {
      throw err;
    }
  }

  async getChatLog({ userNo, chatRoomNo, currentChatLogNo }: PreviousChatLog) {
    try {
      // await this.checkRoom({userNo, chatRoomNo})
      await this.checkUserInChatRoom({ userNo, chatRoomNo });

      const chatLog = await this.chatLogRepository.getPreviousChatLog(
        chatRoomNo,
        currentChatLogNo,
      );
      console.log(chatLog);
    } catch (err) {
      throw err;
    }
  }

  private async checkUserInChatRoom(chatUserInfo: ChatUserInfo) {
    try {
      const result = await this.chatUsersRepository.checkUserInChatRoom(
        chatUserInfo,
      );
      if (!result) {
        throw new BadRequestException(`채팅방에 없는 사용자 입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }
}
