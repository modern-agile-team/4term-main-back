import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { AcceptInvitationDTO } from './dto/accept-invitation.dto';
import { GetChatLogDTO } from './dto/get-chat-log.dto';
import { InviteUserDTO } from './dto/invite-user.dto';
import { ChatList } from './entity/chat-list.entity';
import { ChatLog } from './entity/chat-log.entity';
import {
  ChatRoomList,
  ChatUserInfo,
  UserValidation,
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

    return chatList;
  }

  async getPreviousChatLog(
    getChatLogDto: GetChatLogDTO,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    const { userNo, currentChatLogNo }: GetChatLogDTO = getChatLogDto;

    await this.checkChatRoomExists(chatRoomNo);

    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isUserNeeded: true,
      target: `${userNo}`,
    });

    const previousChatLog: ChatLog[] =
      await this.chatLogRepository.getPreviousChatLog(
        chatRoomNo,
        currentChatLogNo,
      );

    return previousChatLog;
  }

  async getCurrentChatLog(
    getChatLogDto: GetChatLogDTO,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    const { userNo, currentChatLogNo }: GetChatLogDTO = getChatLogDto;

    await this.checkChatRoomExists(chatRoomNo);

    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isUserNeeded: true,
      target: `${userNo}`,
    });

    const currentChatLog: ChatLog[] =
      await this.chatLogRepository.getCurrentChatLog(chatRoomNo);

    return currentChatLog;
  }

  private async checkChatRoomExists(chatRoomNo: number): Promise<void> {
    const chatRoom: ChatList =
      await this.chatListRepository.checkRoomExistsByChatRoomNo(chatRoomNo);
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }
  }

  private async checkUserInChatRoom(
    chatUserInfo: UserValidation,
  ): Promise<void> {
    const {
      userNo,
      chatRoomNo,
      isUserNeeded,
      target: target,
    }: UserValidation = chatUserInfo;

    const chatRoom: ChatList =
      await this.chatListRepository.checkRoomExistsByChatRoomNo(chatRoomNo);
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    const user = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });

    if (isUserNeeded === Boolean(user)) {
      return;
    }

    const error = isUserNeeded
      ? new NotFoundException(`${target}님의 정보를 찾을 수 없습니다.`)
      : new BadRequestException(`채팅방에 이미 ${target}님이 존재합니다.`);

    throw error;
  }

  async inviteUser(
    manager: EntityManager,
    inviteUser: InviteUserDTO,
    chatRoomNo: number,
  ): Promise<void> {
    const { userNo, targetUserNo }: InviteUserDTO = inviteUser;

    const targetUser: ChatUserInfo =
      await this.chatUsersRepository.checkUserInChatRoom({
        userNo: targetUserNo,
        chatRoomNo,
      });
    if (targetUser) {
      throw new BadRequestException('초대 대상이 이미 채팅방에 존재합니다.');
    }

    const user: ChatUserInfo =
      await this.chatUsersRepository.checkUserInChatRoom({
        userNo,
        chatRoomNo,
      });
    if (!user) {
      throw new NotFoundException(`유저 정보를 찾지 못했습니다.`);
    }

    await this.saveNotice(manager, {
      userNo,
      userType: user.userType,
      targetUserNo,
      chatRoomNo,
    });
  }

  private async saveNotice(manager: EntityManager, chatUserInfo: ChatUserInfo) {
    const { userType, targetUserNo, chatRoomNo, userNo } = chatUserInfo;
    const type = userType ? NoticeType.INVITE_HOST : NoticeType.INVITE_GUEST;

    const noticeChat = await this.noticeChatsRepository.checkNoticeChat({
      targetUserNo,
      chatRoomNo,
      type,
      userNo,
    });

    if (noticeChat) {
      throw new BadRequestException('이미 초대를 보낸 상태입니다.');
    }

    const { insertId } = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        userNo,
        targetUserNo,
        type,
      });
    if (!insertId) {
      throw new InternalServerErrorException('Notice 저장에 실패했습니다.');
    }

    const affectedRows = await manager
      .getCustomRepository(NoticeChatsRepository)
      .saveNoticeChat({
        chatRoomNo,
        noticeNo: insertId,
      });
    if (!affectedRows) {
      throw new InternalServerErrorException(
        'Notice Chat 저장에 실패했습니다.',
      );
    }
  }

  async acceptInvitation(
    chatRoomNo: number,
    invitationInfo: AcceptInvitationDTO,
  ): Promise<void> {
    const { inviterNo, targetUserNo, type }: AcceptInvitationDTO =
      invitationInfo;
    const userType =
      type === NoticeType.INVITE_HOST ? UserType.HOST : UserType.GUEST;

    await this.checkUserInChatRoom({
      userNo: inviterNo,
      chatRoomNo,
      isUserNeeded: true,
      target: `초대하신 ${targetUserNo}`,
    });

    await this.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
      isUserNeeded: false,
      target: `${targetUserNo}`,
    });

    await this.joinChatRoom({ userNo: targetUserNo, chatRoomNo, userType });
  }

  private async joinChatRoom(chatUserInfo: ChatUserInfo): Promise<void> {
    const user = [chatUserInfo];

    const affectedRow = await this.chatUsersRepository.setChatRoomUsers(user);
    if (!affectedRow) {
      throw new InternalServerErrorException(`채팅방 유저 추가 오류입니다.`);
    }
  }
}
