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
import { Connection, getConnection, InsertResult } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ChatRoom,
  ChatRoomList,
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
  log(text) {
    console.log(text);
  }

  async initSocket(socket, userNo: number): Promise<void> {
    const chatRoomList = await this.getChatRoomListByUserNo(
      Object.values(userNo),
    );
    if (chatRoomList) {
      chatRoomList.forEach((el) => {
        socket.join(`${el.chatRoomNo}`);
      });
    }
  }

  async createRoom(socket: Socket, chat: CreateChatDto): Promise<void> {
    const { boardNo } = chat;
    const host = UserType.HOST;
    const guest = UserType.GUEST;
    const boardExist = await this.boardRepository.getBoardByNo(boardNo);
    if (!boardExist.no) {
      throw new NotFoundException(`게시물을 찾지 못했습니다.`);
    }

    const roomExist = await this.chatListRepository.checkRoomExistByBoardNo(
      boardNo,
    );
    if (roomExist) {
      throw new BadRequestException('이미 생성된 채팅방 입니다.');
    }

    const { roomName, hostUserNo, guestUserNo } = await this.getUsersByBoardNo(
      boardNo,
    );

    const chatRoomNo: number = await this.createRoomByBoardNo({
      boardNo,
      roomName,
    });
    if (!chatRoomNo) {
      throw new BadRequestException('채팅방 생성 오류입니다.');
    }

    const hostUserNoList: number[] = hostUserNo.split(',').map((item) => {
      return parseInt(item);
    });
    const roomHostUsers: ChatUserInfo[] = hostUserNoList.reduce(
      (values, userNo) => {
        values.push({ chatRoomNo, userNo, userType: host });
        return values;
      },
      [],
    );

    const guestUserNoList: number[] = guestUserNo.split(',').map((item) => {
      return parseInt(item);
    });
    const roomGuestUsers: ChatUserInfo[] = guestUserNoList.reduce(
      (values, userNo) => {
        values.push({ chatRoomNo, userNo, userType: guest });
        return values;
      },
      [],
    );

    const saveHostUsers = await this.setChatRoomUsers(roomHostUsers);
    if (!saveHostUsers) {
      throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
    }

    const saveGuestUsers = await this.setChatRoomUsers(roomGuestUsers);
    if (!saveGuestUsers) {
      throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
    }

    socket.join(`${chatRoomNo}`);
  }

  async joinRoom(socket, chat: JoinChatRoom): Promise<void> {
    const { userNo, chatRoomNo } = chat;
    const user: ChatRoomUsers = await this.chatListRepository.isUserInChatRoom(
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
    const queryRunner = connection.createQueryRunner();

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
      console.log(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
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
    const chatRoom = this.setChatRoom(chatInfo);

    return chatRoom;
  }

  private setChatRoom(chatRoom: ChatRoom): ChatRoom {
    chatRoom.roomName = chatRoom.guestNickname + ',' + chatRoom.hostNickname;

    return chatRoom;
  }

  private async setChatRoomUsers(
    roomUsers: ChatUserInfo[],
  ): Promise<InsertResult> {
    const affectedRows: InsertResult =
      await this.chatUsersRepository.setChatRoomUsers(roomUsers);

    return affectedRows;
  }

  private async createRoomByBoardNo(createChat: CreateChat): Promise<number> {
    const insertId: number = await this.chatListRepository.createRoom(
      createChat,
    );

    return insertId;
  }

  private async checkChatRoom(
    chatRoomNo: number,
    userNo: number,
  ): Promise<void> {
    const chatRoom = await this.chatListRepository.checkRoomExistByChatNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException(`해당 채팅방이 존재하지 않습니다.`);
    }

    const user: ChatRoomUsers = await this.chatListRepository.isUserInChatRoom(
      chatRoomNo,
      userNo,
    );
    if (!user) {
      throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
    }
  }
}
