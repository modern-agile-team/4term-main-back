import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { GetChatLogDTO } from './dto/get-chat-log.dto';
import { InviteUserDTO } from './dto/invite-user.dto';
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
    const chatList: ChatRoomList[] =
      await this.chatUsersRepository.getChatRoomList(userNo);
    if (!chatList.length) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    return chatList;
  }

  async getPreviousChatLog(
    getChatLogDto: GetChatLogDTO,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    const { userNo, currentChatLogNo }: GetChatLogDTO = getChatLogDto;
    const chatRoom = await this.chatListRepository.checkRoomExistsByChatNo(
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

    const previousChatLog = await this.chatLogRepository.getPreviousChatLog(
      chatRoomNo,
      currentChatLogNo,
    );

    return previousChatLog;
  }

  async inviteUser(
    inviteUser: InviteUserDTO,
    chatRoomNo: number,
  ): Promise<void> {
    const { userNo, targetUserNo }: InviteUserDTO = inviteUser;
    const targetUser = await this.chatUsersRepository.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
    });
    if (targetUser) {
      throw new BadRequestException('이미 채팅방에 존재하는 유저입니다.');
    }

    const { userType } = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });

    const type = userType ? NoticeType.INVITE_HOST : NoticeType.INVITE_GUEST;

    const noticeChat = await this.noticeChatsRepository.checkNoticeChat(
      targetUserNo,
      chatRoomNo,
      type,
    );
    if (noticeChat) {
      throw new BadRequestException('이미 초대를 보낸 상태입니다.');
    }

    const { insertId } = await this.noticesRepository.saveNotice({
      userNo,
      targetUserNo,
      type,
    });
    if (!insertId) {
      throw new BadRequestException('Notice 저장에 실패했습니다.');
    }

    const affectedRows = await this.noticeChatsRepository.saveNoticeChat({
      chatRoomNo,
      noticeNo: insertId,
    });
    if (!affectedRows) {
      throw new BadRequestException('Notice Chat 저장에 실패했습니다.');
    }
  }
}
