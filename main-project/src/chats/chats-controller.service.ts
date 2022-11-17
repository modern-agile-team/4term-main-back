import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { Notices } from 'src/notices/entity/notices.entity';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { ChatLog } from './entity/chat-log.entity';
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

    @InjectRepository(NoticesRepository)
    private readonly noticesRepository: NoticesRepository,

    @InjectRepository(NoticeChatsRepository)
    private readonly noticeChatsRepository: NoticeChatsRepository,
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

  async getChatLog({
    userNo,
    chatRoomNo,
    currentChatLogNo,
  }: PreviousChatLog): Promise<ChatLog[]> {
    try {
      const chatRoom = await this.checkChatRoom({ userNo, chatRoomNo });
      if (!chatRoom) {
        throw new BadRequestException('존재하지 않는 채팅방입니다.');
      }
      const user = await this.checkUserInChatRoom({ userNo, chatRoomNo });
      if (!user) {
        throw new BadRequestException('채팅방에 존재하지 않는 유저입니다.');
      }
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
      const chatRoom = await this.checkChatRoom({ userNo, chatRoomNo });
      if (!chatRoom) {
        throw new BadRequestException('존재하지 않는 채팅방입니다.');
      }
      const user = await this.checkUserInChatRoom({ userNo, chatRoomNo });
      if (!user) {
        throw new BadRequestException('채팅방에 존재하지 않는 유저입니다.');
      }

      const chatLog = await this.chatLogRepository.getRecentChatLog(chatRoomNo);

      return chatLog;
    } catch (error) {
      throw error;
    }
  }

  async inviteUser(userNo, targetUserNo, chatRoomNo): Promise<void> {
    try {
      const type = NoticeType.INVITE_CHAT;
      const user = await this.checkUserInChatRoom({
        userNo: targetUserNo,
        chatRoomNo,
      });
      if (user) {
        throw new BadRequestException('이미 채팅방에 존재하는 유저입니다.');
      }

      const noticeChat = await this.checkNoticeChat(
        targetUserNo,
        chatRoomNo,
        type,
      );
      if (noticeChat) {
        throw new BadRequestException('이미 초대를 보낸 상태입니다.');
      }

      const noticeNo = await this.noticesRepository.saveNoticeChatInvite({
        userNo,
        targetUserNo,
        type,
      });
      if (!noticeNo) {
        throw new BadRequestException('채팅방 초대에 실패했습니다.');
      }

      const insertId = await this.noticeChatsRepository.saveNoticeChat({
        chatRoomNo,
        noticeNo,
      });
      if (!insertId) {
        throw new BadRequestException('알람 정보 저장 오류입니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  private async checkNoticeChat(
    targetUserNo,
    chatRoomNo,
    type,
  ): Promise<Notices> {
    try {
      const noticeChat = await this.noticesRepository.checkNoticeChat(
        targetUserNo,
        chatRoomNo,
        type,
      );

      return noticeChat;
    } catch (error) {
      throw error;
    }
  }

  async acceptInvitation(noticeNo, userNo): Promise<void> {
    try {
      const chatRoomNo = await this.getNoticeChatRoomNo(noticeNo, userNo);
      if (!chatRoomNo) {
        throw new BadRequestException('초대 정보가 존재하지 않습니다.');
      }
      const chatRoom = await this.checkChatRoom({ chatRoomNo, userNo });
      if (!chatRoom) {
        throw new BadRequestException('존재하지 않는 채팅방입니다.');
      }
      const user = await this.checkUserInChatRoom({ chatRoomNo, userNo });
      if (user) {
        throw new BadRequestException('이미 참여중인 채팅방 입니다.');
      }
      const result = await this.setChatRoomUser({ chatRoomNo, userNo });
      if (!result) {
        throw new BadRequestException('채팅방 초대 수락 오류입니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  // async createChatRoom(meetingNo, hostNo, meetingMembersList) {
  //   console.log(meetingNo, hostNo, meetingMembersList);
  //   console.log(Object.keys(meetingMembersList));
  // }

  private async setChatRoomUser(chatUserInfo: ChatUserInfo): Promise<number> {
    try {
      const affectedRows = await this.chatUsersRepository.setChatRoomUser(
        chatUserInfo,
      );
      return affectedRows;
    } catch (error) {}
  }

  private async getNoticeChatRoomNo(
    noticeNo: number,
    userNo: number,
  ): Promise<number> {
    try {
      const chatRoomNo = await this.noticesRepository.getNoticeChatRoomNo(
        noticeNo,
        userNo,
      );

      return chatRoomNo;
    } catch (error) {}
  }

  private async checkChatRoom(chatUserInfo: ChatUserInfo): Promise<any> {
    try {
      const { chatRoomNo } = chatUserInfo;
      const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
        chatRoomNo,
      );

      return chatRoom;
    } catch (error) {
      throw error;
    }
  }

  private async checkUserInChatRoom(
    chatUserInfo: ChatUserInfo,
  ): Promise<ChatUserInfo> {
    try {
      const chatUser = await this.chatUsersRepository.checkUserInChatRoom(
        chatUserInfo,
      );

      return chatUser;
    } catch (error) {
      throw error;
    }
  }
}
