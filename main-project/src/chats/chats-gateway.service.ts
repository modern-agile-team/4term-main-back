import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { UserType } from 'src/common/configs/user-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { Connection, getConnection, InsertResult, QueryRunner } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatLog } from './entity/chat-log.entity';
import {
  ChatRoom,
  ChatRoomList,
  ChatRoomUser,
  ChatRoomUsers,
  ChatUserInfo,
  CreateChat,
  FileUrlDetail,
  JoinChatRoom,
  MessagePayload,
} from './interface/chat.interface';
import { ChatFileUrlsRepository } from './repository/chat-file-urls.repository';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsGatewayService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,

    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(ChatLogRepository)
    private readonly chatLogRepository: ChatLogRepository,

    @InjectRepository(BoardRepository)
    private readonly boardRepository: BoardRepository,

    @InjectRepository(ChatFileUrlsRepository)
    private readonly chatFileUrlsRepository: ChatFileUrlsRepository,
  ) {}

  async initSocket(socket, userNo: number): Promise<ChatRoomList[]> {
    const chatRoomList = await this.getChatRoomListByUserNo(
      Object.values(userNo),
    );
    if (chatRoomList) {
      chatRoomList.forEach((el) => {
        socket.join(`${el.chatRoomNo}`);
      });
    }

    return chatRoomList;
  }

  async createRoom(socket: Socket, chat: CreateChatDto): Promise<void> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { boardNo } = chat;

    try {
      await this.checkChatRoomExists(boardNo);

      const { roomName, hostUserNo, guestUserNo } =
        await this.getUsersByBoardNo(boardNo);

      const chatRoomNo: number = await this.createRoomByBoardNo(queryRunner, {
        boardNo,
        roomName,
      });

      await this.setChatRoom(queryRunner, {
        users: hostUserNo,
        userType: UserType.HOST,
        chatRoomNo,
      });

      await this.setChatRoom(queryRunner, {
        users: guestUserNo,
        userType: UserType.GUEST,
        chatRoomNo,
      });

      await queryRunner.commitTransaction();

      socket.join(`${chatRoomNo}`);
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async setChatRoom(
    queryRunner: QueryRunner,
    chatRoomUsers: ChatRoomUsers,
  ): Promise<void> {
    const { users, userType, chatRoomNo }: ChatRoomUsers = chatRoomUsers;

    const userList: number[] = users.split(',').map((item) => {
      return parseInt(item);
    });

    const chatUserList: ChatUserInfo[] = userList.reduce((values, userNo) => {
      values.push({ chatRoomNo, userNo, userType });

      return values;
    }, []);

    await this.setChatRoomUsers(queryRunner, chatUserList);
  }

  private async checkChatRoomExists(boardNo): Promise<void> {
    const boardExists = await this.boardRepository.getBoardByNo(boardNo);
    if (!boardExists.no) {
      throw new NotFoundException(`게시물을 찾지 못했습니다.`);
    }

    const roomExists = await this.chatListRepository.checkRoomExistByBoardNo(
      boardNo,
    );
    if (roomExists) {
      throw new BadRequestException('이미 생성된 채팅방 입니다.');
    }
  }

  async joinRoom(socket, chat: JoinChatRoom): Promise<ChatLog[]> {
    const { userNo, chatRoomNo } = chat;
    const user: ChatRoomUser = await this.chatListRepository.isUserInChatRoom(
      chatRoomNo,
      userNo,
    );
    if (!user) {
      throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
    }

    socket.join(`${user.chatRoomNo}`);

    //추후 로그 또는 삭제
    socket.broadcast.to(`${user.chatRoomNo}`).emit('join-room', {
      username: user.nickname,
      msg: `${user.nickname}님이 접속하셨습니다.`,
    });

    const recentChatLog = this.chatLogRepository.getRecentChatLog(chatRoomNo);

    return recentChatLog;
  }

  async getChatRoomListByUserNo(userNo): Promise<ChatRoomList[]> {
    const chatList: ChatRoomList[] =
      await this.chatUsersRepository.getChatRoomList(userNo);
    if (!chatList.length) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    return chatList;
  }

  async sendChat(socket, messagePayload: MessagePayload): Promise<void> {
    const { userNo, chatRoomNo, message }: MessagePayload = messagePayload;

    await this.checkChatRoom(chatRoomNo, userNo);

    await this.saveMessage(messagePayload);

    socket.broadcast.to(`${chatRoomNo}`).emit('message', {
      message,
      userNo,
      chatRoomNo,
    });
  }

  async sendFile(
    socket: Socket,
    messagePayload: MessagePayload,
  ): Promise<void> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userNo, chatRoomNo, uploadedFileUrls }: MessagePayload =
        messagePayload;

      const chatLogNo = await this.saveMessageByQueryRunner(
        queryRunner,
        messagePayload,
      );

      await this.saveFileUrls(queryRunner, messagePayload, chatLogNo);

      await queryRunner.commitTransaction();

      socket.broadcast.to(`${chatRoomNo}`).emit('message', {
        message: uploadedFileUrls,
        userNo,
        chatRoomNo,
      });
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async saveMessageByQueryRunner(
    queryRunner,
    messagePayload,
  ): Promise<InsertResult> {
    const insertId: InsertResult = await queryRunner.manager
      .getCustomRepository(ChatLogRepository)
      .saveMessage(messagePayload);
    if (!insertId) {
      throw new InternalServerErrorException('메세지 저장에 실패하였습니다.');
    }

    return insertId;
  }

  private async saveFileUrls(
    queryRunner,
    messagePayload,
    chatLogNo,
  ): Promise<void> {
    const { uploadedFileUrls }: MessagePayload = messagePayload;
    const fileUrlDetail: FileUrlDetail[] = uploadedFileUrls.reduce(
      (values, fileUrl) => {
        values.push({ chatLogNo, fileUrl });

        return values;
      },
      [],
    );

    const { affectedRows }: InsertRaw = await queryRunner.manager
      .getCustomRepository(ChatFileUrlsRepository)
      .saveFileUrl(fileUrlDetail);
    if (affectedRows !== fileUrlDetail.length) {
      throw new InternalServerErrorException('파일 url 저장에 실패하였습니다.');
    }
  }

  private async saveMessage(messagePayload: MessagePayload): Promise<void> {
    const insertId = await this.chatLogRepository.saveMessage(messagePayload);
    if (!insertId) {
      throw new BadRequestException('매세지 저장 오류 입니다.');
    }
  }

  private async getUsersByBoardNo(boardNo: number): Promise<ChatRoom> {
    const chatInfo: ChatRoom = await this.boardRepository.getUserListByBoardNo(
      boardNo,
    );

    if (!chatInfo) {
      throw new NotFoundException('유저 조회 오류입니다.');
    }
    const chatRoom = this.setChatRoomName(chatInfo);

    return chatRoom;
  }

  private setChatRoomName(chatRoom: ChatRoom): ChatRoom {
    chatRoom.roomName = chatRoom.guestNickname + ',' + chatRoom.hostNickname;

    return chatRoom;
  }

  private async setChatRoomUsers(
    queryRunner: QueryRunner,
    roomUsers: ChatUserInfo[],
  ): Promise<number> {
    const affectedRows: number = await queryRunner.manager
      .getCustomRepository(ChatUsersRepository)
      .setChatRoomUsers(roomUsers);
    if (!affectedRows) {
      throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
    }

    return affectedRows;
  }

  private async createRoomByBoardNo(
    queryRunner: QueryRunner,
    createChat: CreateChat,
  ): Promise<number> {
    const insertId: number = await queryRunner.manager
      .getCustomRepository(ChatListRepository)
      .createChatRoom(createChat);
    if (!insertId) {
      throw new InternalServerErrorException(`채팅방 생성 오류입니다.`);
    }

    return insertId;
  }

  private async checkChatRoom(
    chatRoomNo: number,
    userNo: number,
  ): Promise<void> {
    const chatRoom = await this.chatListRepository.checkRoomExistsByChatRoomNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException(`해당 채팅방이 존재하지 않습니다.`);
    }

    const user: ChatRoomUser = await this.chatListRepository.isUserInChatRoom(
      chatRoomNo,
      userNo,
    );
    if (!user) {
      throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
    }
  }
}
