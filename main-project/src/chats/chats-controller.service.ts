import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Boards } from 'src/boards/entity/board.entity';
import { BoardGuestTeamsRepository } from 'src/boards/repository/board-guest-team.repository';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChats } from 'src/notices/entity/notice-chat.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { EntityManager, Timestamp } from 'typeorm';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChatList } from './entity/chat-list.entity';
import { ChatLog } from './entity/chat-log.entity';
import {
  BoardGuestTeam,
  ChatRoomBeforeCreate,
  ChatRoomInvitation,
  ChatRoomOfBoard,
  ChatRoomWithUsers,
  ChatUser,
  ChatUserValidation,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsControllerService {
  constructor(
    private readonly chatUsersRepository: ChatUsersRepository,
    private readonly chatLogRepository: ChatLogRepository,
    private readonly chatListRepository: ChatListRepository,
    private readonly noticeChatsRepository: NoticeChatsRepository,
    private readonly boardRepository: BoardsRepository,
    private readonly boardGuestTeamsRepository: BoardGuestTeamsRepository,
  ) {}
  async createChatRoom(
    userNo: number,
    manager: EntityManager,
    boardNo: number,
    guestTeamNo: number,
  ): Promise<void> {
    await this.checkChatRoomExists(userNo, boardNo, guestTeamNo);

    const { roomName, hostsUserNo, guestsUserNo } =
      await this.getUsersByBoardNo(boardNo, userNo, guestTeamNo);

    const chatRoomNo: number = await this.createChatRoomByBoardNo(manager, {
      boardNo,
      roomName,
    });

    const chatUsers: number[][] = await Promise.all([
      await this.setChatRoomUsers(manager, {
        users: hostsUserNo,
        userType: UserType.HOST,
        chatRoomNo,
      }),
      await this.setChatRoomUsers(manager, {
        users: guestsUserNo,
        userType: UserType.GUEST,
        chatRoomNo,
      }),
    ]);

    const users: number[] = chatUsers.flat();

    await Promise.all(
      users.map(
        async (receiverNo) =>
          await this.createChatRoomNotice(receiverNo, userNo, manager),
      ),
    );
  }

  private async createChatRoomNotice(
    userNo: number,
    targetUserNo: number,
    manager: EntityManager,
  ) {
    await manager.getCustomRepository(NoticesRepository).saveNotice({
      userNo,
      targetUserNo,
      type: NoticeType.CHAT_ROOM_CREATED,
    });
  }

  private async checkChatRoomExists(
    userNo: number,
    boardNo: number,
    guestTeamNo: number,
  ): Promise<void> {
    const board: Boards = await this.boardRepository.getBoard(boardNo);
    if (!board) {
      throw new NotFoundException('게시물을 찾지 못했습니다.');
    }
    if (board.userNo !== userNo) {
      throw new BadRequestException('게시글의 작성자만 수락할 수 있습니다.');
    }

    const guestTeams: BoardGuestTeam[] =
      await this.boardGuestTeamsRepository.getGuestTeams(boardNo);
    if (!guestTeams[0]) {
      throw new NotFoundException(`여름 요청이 존재하지 않습니다.`);
    }

    const matchTeamNo: boolean = guestTeams.some(
      (guestTeam) => guestTeam.teamNo === guestTeamNo,
    );
    if (!matchTeamNo) {
      throw new NotFoundException(`일치하는 여름 요청이 없습니다.`);
    }

    const chatRoom: ChatList =
      await this.chatListRepository.getChatRoomByBoardNo(boardNo);
    if (chatRoom) {
      throw new BadRequestException('이미 생성된 채팅방 입니다.');
    }
  }

  private async getUsersByBoardNo(
    boardNo: number,
    userNo: number,
    guestTeamNo: number,
  ): Promise<ChatRoomOfBoard> {
    const chatUsersOfBoard: ChatRoomOfBoard =
      await this.boardRepository.getUsersByBoardNo(
        boardNo,
        userNo,
        guestTeamNo,
      );

    const chatRoom: ChatRoomOfBoard = this.setChatRoomName(chatUsersOfBoard);

    return chatRoom;
  }

  private setChatRoomName(chatRoom: ChatRoomOfBoard): ChatRoomOfBoard {
    chatRoom.roomName = chatRoom.guestsNickname + ',' + chatRoom.hostsNickname;

    return chatRoom;
  }

  private async createChatRoomByBoardNo(
    manager: EntityManager,
    chatRoom: ChatRoomBeforeCreate,
  ): Promise<number> {
    const createResult: number = await manager
      .getCustomRepository(ChatListRepository)
      .createChatRoom(chatRoom);
    if (!createResult) {
      throw new InternalServerErrorException(`채팅방 생성 오류입니다.`);
    }

    return createResult;
  }

  private async setChatRoomUsers(
    manager: EntityManager,
    chatRoomUsers: ChatRoomWithUsers,
  ): Promise<any> {
    const { userType, chatRoomNo }: ChatRoomWithUsers = chatRoomUsers;
    const users: number[] = chatRoomUsers.users.split(',').map(Number);

    const chatUsers: ChatUser[] = users.reduce((values, userNo) => {
      values.push({ chatRoomNo, userNo, userType });

      return values;
    }, []);

    await this.createChatUsers(manager, chatUsers);
    return users;
  }

  private async createChatUsers(
    manager: EntityManager,
    chatUsers: ChatUser[],
  ): Promise<number> {
    const insertResult: number = await manager
      .getCustomRepository(ChatUsersRepository)
      .createChatUsers(chatUsers);

    if (!insertResult) {
      throw new InternalServerErrorException(
        '채팅방 유저정보 생성 오류입니다.',
      );
    }

    return insertResult;
  }

  async getPreviousChatLog(
    userNo: number,
    chatRoomNo: number,
    currentChatLogNo: number,
  ): Promise<ChatLog[]> {
    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: true,
    });

    const previousChatLog: ChatLog[] =
      await this.chatLogRepository.getPreviousChatLog(
        chatRoomNo,
        currentChatLogNo,
      );

    return previousChatLog;
  }

  async getCurrentChatLog(
    userNo: number,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: true,
    });

    const currentChatLog: ChatLog[] =
      await this.chatLogRepository.getCurrentChatLog(chatRoomNo);

    return currentChatLog;
  }

  private async checkUserInChatRoom({
    userNo,
    chatRoomNo,
    isNeededUser,
  }: ChatUserValidation): Promise<ChatUser> {
    const chatRoom: ChatList = await this.chatListRepository.getChatRoomByNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    const user: ChatUser = await this.chatUsersRepository.getChatRoomUser(
      userNo,
      chatRoomNo,
    );

    if (isNeededUser === Boolean(user)) {
      return user;
    }

    const error = isNeededUser
      ? new NotFoundException(
          `채팅방에서 ${userNo}님의 정보를 찾을 수 없습니다.`,
        )
      : new BadRequestException(`채팅방에 이미 ${userNo}님이 존재합니다.`);

    throw error;
  }

  async inviteUser(
    userNo: number,
    manager: EntityManager,
    targetUserNo: number,
    chatRoomNo: number,
  ): Promise<void> {
    const inviter: ChatUser = await this.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
      isNeededUser: true,
    });
    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: false,
    });

    await this.saveNotice(manager, {
      userNo,
      userType: inviter.userType,
      targetUserNo,
      chatRoomNo,
    });
  }

  private async saveNotice(
    manager: EntityManager,
    chatRoomInvitation: ChatRoomInvitation,
  ) {
    const { userNo, userType, targetUserNo, chatRoomNo } = chatRoomInvitation;
    const noticeType = userType
      ? NoticeType.INVITE_HOST
      : NoticeType.INVITE_GUEST;

    const noticeChat: Notices = await this.noticeChatsRepository.getNotice({
      userNo,
      targetUserNo,
      type: noticeType,
      chatRoomNo,
    });
    if (noticeChat) {
      throw new BadRequestException('이미 초대를 보낸 상태입니다.');
    }

    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        userNo,
        targetUserNo,
        type: noticeType,
      });
    if (!insertId) {
      throw new InternalServerErrorException('Notice 저장에 실패했습니다.');
    }

    const insertResult: number = await manager
      .getCustomRepository(NoticeChatsRepository)
      .saveNoticeChat({
        noticeNo: insertId,
        chatRoomNo,
      });
    if (!insertResult) {
      throw new InternalServerErrorException(
        'Notice Chat 저장에 실패했습니다.',
      );
    }
  }

  async acceptInvitation(
    userNo: number,
    manager: EntityManager,
    chatRoomNo: number,
    { senderNo, type }: AcceptInvitationDto,
  ): Promise<void> {
    const noticeNo: number = await this.checkChatNotice(
      userNo,
      senderNo,
      chatRoomNo,
      type,
    );

    const userType =
      type === NoticeType.INVITE_HOST ? UserType.HOST : UserType.GUEST;

    await this.checkUserInChatRoom({
      userNo: senderNo,
      chatRoomNo,
      isNeededUser: true,
    });

    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: false,
    });

    await this.joinChatRoom(manager, { userNo, chatRoomNo, userType });
    await this.deleteNotice(manager, noticeNo);
  }

  private async checkChatNotice(
    userNo: number,
    senderNo: number,
    chatRoomNo: number,
    type: number,
  ): Promise<number> {
    const notice: Notices = await this.noticeChatsRepository.getNotice({
      userNo,
      targetUserNo: senderNo,
      type,
      chatRoomNo,
    });
    if (!notice) {
      throw new NotFoundException(`초대 정보가 존재하지 않습니다.`);
    }
    return notice.no;
  }

  private async joinChatRoom(
    manager: EntityManager,
    chatUserInfo: ChatUser,
  ): Promise<void> {
    const user = [chatUserInfo];

    const affectedRow: number = await manager
      .getCustomRepository(ChatUsersRepository)
      .createChatUsers(user);
    if (!affectedRow) {
      throw new InternalServerErrorException(`채팅방 유저 추가 오류입니다.`);
    }
  }

  private async deleteNotice(manager: EntityManager, noticeNo: number) {
    const deleteResult: number = await manager
      .getCustomRepository(NoticesRepository)
      .deleteNotice(noticeNo);
    if (!deleteResult) {
      throw new InternalServerErrorException(`알림 삭제에 실패했습니다.`);
    }
  }
}
