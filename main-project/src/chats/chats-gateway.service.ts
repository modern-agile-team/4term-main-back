import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Board } from 'src/boards/interface/boards.interface';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { UserType } from 'src/common/configs/user-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import {
  Connection,
  EntityManager,
  getConnection,
  InsertResult,
  QueryRunner,
} from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { InitSocketDto } from './dto/init-socket.dto';
import { JoinChatRoomDto } from './dto/join-chat.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { ChatLog } from './entity/chat-log.entity';
import {
  ChatRoomToSet,
  ChatRoom,
  ChatRoomUser,
  ChatRoomUsers,
  ChatUserInfo,
  ChatToCreate,
  FileUrlDetail,
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

  async initSocket(socket, messagePayload: InitSocketDto): Promise<ChatRoom[]> {
    const { userNo } = messagePayload;
    const chatRooms: ChatRoom[] = await this.getChatRoomsByUserNo(userNo);
    if (chatRooms) {
      chatRooms.forEach((chatRoom) => {
        socket.join(`${chatRoom.chatRoomNo}`);
      });
    }

    return chatRooms;
  }

  async createRoom(
    manager: EntityManager,
    socket: Socket,
    messagePayload: CreateChatDto,
  ): Promise<number> {
    const { boardNo } = messagePayload;

    await this.checkChatRoomExists(boardNo);

    const { roomName, hostUserNo, guestUserNo } = await this.getUsersByBoardNo(
      boardNo,
    );
    const chatRoomNo: number = await this.createRoomByBoardNo(manager, {
      boardNo,
      roomName,
    });

    await this.setChatRoom(manager, {
      users: hostUserNo,
      userType: UserType.HOST,
      chatRoomNo,
    });

    await this.setChatRoom(manager, {
      users: guestUserNo,
      userType: UserType.GUEST,
      chatRoomNo,
    });

    socket.join(`${chatRoomNo}`);

    return chatRoomNo;
  }

  private async setChatRoom(
    manager: EntityManager,
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

    await this.setChatRoomUsers(manager, chatUserList);
  }

  private async checkChatRoomExists(boardNo): Promise<void> {
    const board: Board = await this.boardRepository.getBoardByNo(boardNo);
    if (!board.no) {
      throw new NotFoundException(`게시물을 찾지 못했습니다.`);
    }

    const chatRoom = await this.chatListRepository.checkRoomExistByBoardNo(
      boardNo,
    );
    if (chatRoom) {
      throw new BadRequestException('이미 생성된 채팅방 입니다.');
    }
  }

  async getChatRoomsByUserNo(userNo: number): Promise<ChatRoom[]> {
    const chatRooms: ChatRoom[] = await this.chatUsersRepository.getChatRooms(
      userNo,
    );
    if (!chatRooms.length) {
      throw new BadRequestException('채팅방이 존재하지 않습니다.');
    }

    return chatRooms;
  }

  async sendChat(socket, messagePayload: MessagePayloadDto): Promise<void> {
    const { userNo, chatRoomNo, message }: MessagePayloadDto = messagePayload;

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
    messagePayload: MessagePayloadDto,
  ): Promise<void> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { userNo, chatRoomNo, uploadedFileUrls }: MessagePayloadDto =
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
    const { uploadedFileUrls }: MessagePayloadDto = messagePayload;
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

  private async saveMessage(messagePayload: MessagePayloadDto): Promise<void> {
    const insertId = await this.chatLogRepository.saveMessage(messagePayload);
    if (!insertId) {
      throw new BadRequestException('매세지 저장 오류 입니다.');
    }
  }

  private async getUsersByBoardNo(boardNo: number): Promise<ChatRoomToSet> {
    const chatInfo: ChatRoomToSet =
      await this.boardRepository.getUserListByBoardNo(boardNo);

    if (!chatInfo) {
      throw new NotFoundException('유저 조회 오류입니다.');
    }
    const chatRoom = this.setChatRoomName(chatInfo);

    return chatRoom;
  }

  private setChatRoomName(chatRoom: ChatRoomToSet): ChatRoomToSet {
    chatRoom.roomName = chatRoom.guestNickname + ',' + chatRoom.hostNickname;

    return chatRoom;
  }

  private async setChatRoomUsers(
    manager: EntityManager,
    roomUsers: ChatUserInfo[],
  ): Promise<number> {
    const affectedRows: number = await manager
      .getCustomRepository(ChatUsersRepository)
      .setChatRoomUsers(roomUsers);

    if (!affectedRows) {
      throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
    }

    return affectedRows;
  }

  private async createRoomByBoardNo(
    manager: EntityManager,
    createChat: ChatToCreate,
  ): Promise<number> {
    const insertId: number = await manager
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
