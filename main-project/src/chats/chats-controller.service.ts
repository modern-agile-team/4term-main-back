import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChatRoomList,
  ChatUserInfo,
  PreviousChatLog,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsControllerService {
  constructor(
    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(ChatLogRepository)
    private readonly chatLogRepository: ChatLogRepository,

    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,
  ) {}

  async getChatRoomListByUserNo(userNo): Promise<ChatRoomList[]> {
    try {
      const chatList: ChatRoomList[] =
        await this.chatUsersRepository.getChatRoomList(userNo);
      if (!chatList.length) {
        throw new BadRequestException('채팅방이 존재하지 않습니다.');
      }

      return chatList;
    } catch (error) {
      throw error;
    }
  }

  async getChatLog({ userNo, chatRoomNo, currentChatLogNo }: PreviousChatLog) {
    try {
      await this.checkChatRoom({ userNo, chatRoomNo });

      const chatLog = await this.chatLogRepository.getPreviousChatLog(
        chatRoomNo,
        currentChatLogNo,
      );

      return chatLog;
    } catch (error) {
      throw error;
    }
  }

  async getRecentChatLog({ userNo, chatRoomNo }: PreviousChatLog) {
    try {
      await this.checkChatRoom({ userNo, chatRoomNo });

      const chatLog = await this.chatLogRepository.getRecentChatLog(chatRoomNo);

      return chatLog;
    } catch (error) {
      throw error;
    }
  }

  private async checkChatRoom(chatUserInfo: ChatUserInfo): Promise<void> {
    try {
      const { chatRoomNo } = chatUserInfo;
      const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
        chatRoomNo,
      );

      if (!chatRoom) {
        throw new BadRequestException('존재하지 않는 채팅방입니다.');
      }

      await this.checkUserInChatRoom(chatUserInfo);
    } catch (error) {
      throw error;
    }
  }

  private async checkUserInChatRoom(chatUserInfo: ChatUserInfo): Promise<void> {
    try {
      const chatUser = await this.chatUsersRepository.checkUserInChatRoom(
        chatUserInfo,
      );
      if (!chatUser) {
        throw new BadRequestException(`채팅방에 존재하지 않는 사용자 입니다.`);
      }
    } catch (error) {
      throw error;
    }
  }
}
