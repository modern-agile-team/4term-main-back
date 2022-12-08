import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { ChatLog } from './entity/chat-log.entity';
import { ChatRoomList, PreviousChatLog } from './interface/chat.interface';
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
    const chatList: ChatRoomList[] =
      await this.chatUsersRepository.getChatRoomList(userNo);
    if (!chatList.length) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    return chatList;
  }

  async getChatLog({
    userNo,
    chatRoomNo,
    currentChatLogNo,
  }: PreviousChatLog): Promise<ChatLog[]> {
    const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    const user = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });
    if (!user) {
      throw new BadRequestException('채팅방에 존재하지 않는 유저입니다.');
    }

    const chatLog = await this.chatLogRepository.getPreviousChatLog(
      chatRoomNo,
      currentChatLogNo,
    );

    return chatLog;
  }

  async getRecentChatLog({ userNo, chatRoomNo }: PreviousChatLog) {
    const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    const user = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });
    if (!user) {
      throw new BadRequestException('채팅방에 존재하지 않는 유저입니다.');
    }

    const chatLog = await this.chatLogRepository.getRecentChatLog(chatRoomNo);

    return chatLog;
  }

  async inviteUser(userNo, targetUserNo, chatRoomNo): Promise<void> {
    const user = await this.chatUsersRepository.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
    });
    if (user) {
      throw new BadRequestException('이미 채팅방에 존재하는 유저입니다.');
    }

    const { userType } = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });
    const type = userType ? NoticeType.INVITE_HOST : NoticeType.INVITE_GUEST;

    const noticeChat = await this.noticesRepository.checkNoticeChat(
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
  }

  async acceptInvitation(noticeNo, userNo): Promise<void> {
    const notice = await this.noticesRepository.getNoticeChatRoomNo(
      noticeNo,
      userNo,
    );
    if (!notice) {
      throw new BadRequestException('초대 정보가 존재하지 않습니다.');
    }
    const chatRoomNo = notice.chatRoomNo;
    const userType =
      notice.type == NoticeType.INVITE_HOST ? UserType.HOST : UserType.GUEST;

    const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    const user = await this.chatUsersRepository.checkUserInChatRoom({
      chatRoomNo,
      userNo,
    });
    if (user) {
      throw new BadRequestException('이미 참여중인 채팅방 입니다.');
    }

    const result = await this.chatUsersRepository.setChatRoomUser({
      chatRoomNo,
      userNo,
      userType,
    });
    if (!result) {
      throw new BadRequestException('채팅방 초대 수락 오류입니다.');
    }
  }
}
