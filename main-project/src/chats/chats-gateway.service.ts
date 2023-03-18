import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Socket } from 'socket.io';
import { Boards } from 'src/boards/entity/board.entity';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { UserType } from 'src/common/configs/user-type.config';
import { Meetings } from 'src/meetings/entity/meeting.entity';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { EntityManager } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { SendMeetingDto } from './dto/send-meeting.dto';
import { ChatList } from './entity/chat-list.entity';
import {
  ChatMessage,
  ChatRoom,
  ChatRoomBeforeCreate,
  ChatRoomOfBoard,
  ChatRoomWithUsers,
  ChatUser,
  FileUrl,
} from './interface/chat.interface';
import { ChatFileUrlsRepository } from './repository/chat-file-urls.repository';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsGatewayService {
  constructor(
    private readonly chatListRepository: ChatListRepository,
    private readonly chatUsersRepository: ChatUsersRepository,
    private readonly chatLogRepository: ChatLogRepository,
    private readonly meetingRepository: MeetingRepository,
  ) {}

  async initSocket(socket, userNo: number): Promise<any> {
    const chatRooms: ChatRoomWithUsers[] = await this.getChatRooms(userNo);
    if (!chatRooms) {
      return;
    }
    chatRooms.forEach((chatRoom) => {
      socket.join(`${chatRoom.chatRoomNo}`);
    });

    return chatRooms;
  }

  async getChatRooms(userNo: number): Promise<ChatRoomWithUsers[]> {
    const rooms = await this.chatUsersRepository.getChatRoomNoByUserNo(userNo);
    if (!rooms) {
      return;
    }
    const chatRooms = JSON.parse(rooms);
    const chatRoomsWithUsers: ChatRoomWithUsers[] =
      await this.chatUsersRepository.getChatRoomsWithUsers(chatRooms);

    chatRoomsWithUsers.forEach((chatRoom) => {
      chatRoom.users = JSON.parse(chatRoom.users);
    });

    return chatRoomsWithUsers;
  }

  async sendChat(
    socket: Socket,
    messagePayload: MessagePayloadDto,
    userNo: number,
  ): Promise<void> {
    const { chatRoomNo, message }: MessagePayloadDto = messagePayload;

    await this.checkChatRoom(chatRoomNo, userNo);
    await this.saveMessage({ chatRoomNo, userNo, message });

    socket.broadcast.to(`${chatRoomNo}`).emit('message', {
      message,
      userNo,
      chatRoomNo,
    });
  }

  async sendFile(
    userNo: number,
    socket: Socket,
    messagePayload: MessagePayloadDto,
    manager: EntityManager,
  ): Promise<void> {
    const { chatRoomNo, uploadedFileUrls }: MessagePayloadDto = messagePayload;

    await this.checkChatRoom(chatRoomNo, userNo);

    const chatLogNo: number = await this.saveMessageByEntityManager(manager, {
      chatRoomNo,
      userNo,
    });

    await this.saveFileUrls(manager, messagePayload, chatLogNo);

    socket.broadcast.to(`${chatRoomNo}`).emit('message', {
      message: uploadedFileUrls,
      userNo,
      chatRoomNo,
    });
  }

  private async saveMessageByEntityManager(
    manager: EntityManager,
    messagePayload: ChatMessage,
  ): Promise<number> {
    const insertId: number = await manager
      .getCustomRepository(ChatLogRepository)
      .saveMessage(messagePayload);
    if (!insertId) {
      throw new InternalServerErrorException('메세지 저장에 실패하였습니다.');
    }

    return insertId;
  }

  private async saveFileUrls(
    manager: EntityManager,
    messagePayload,
    chatLogNo,
  ): Promise<void> {
    const { uploadedFileUrls }: MessagePayloadDto = messagePayload;
    const fileUrl: FileUrl[] = uploadedFileUrls.reduce((values, fileUrl) => {
      values.push({ chatLogNo, fileUrl });

      return values;
    }, []);

    const { affectedRows }: ResultSetHeader = await manager
      .getCustomRepository(ChatFileUrlsRepository)
      .saveFileUrl(fileUrl);
    if (affectedRows !== fileUrl.length) {
      throw new InternalServerErrorException('파일 url 저장에 실패하였습니다.');
    }
  }

  private async saveMessage(messagePayload: ChatMessage): Promise<void> {
    const insertId: number = await this.chatLogRepository.saveMessage(
      messagePayload,
    );
    if (!insertId) {
      throw new BadRequestException('매세지 저장 오류 입니다.');
    }
  }

  private async checkChatRoom(
    chatRoomNo: number,
    userNo: number,
  ): Promise<void> {
    const chatRoom: ChatList = await this.chatListRepository.getChatRoomByNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException(`해당 채팅방이 존재하지 않습니다.`);
    }

    const user: ChatUser = await this.chatListRepository.getUser(
      chatRoomNo,
      userNo,
    );
    if (!user) {
      throw new BadRequestException('채팅방에 유저의 정보가 없습니다.');
    }
  }

  async leaveChatRoom(
    userNo: number,
    socket: Socket,
    chatRoomNo: number,
  ): Promise<void> {
    await this.checkChatRoom(chatRoomNo, userNo);
    await this.chatUsersRepository.deleteChatRoomUser({ userNo, chatRoomNo });

    socket.leave(`${chatRoomNo}`);
    socket.broadcast
      .to(`${chatRoomNo}`)
      .emit('message', { message: `${userNo}가 나갔습니다.` });
  }

  async sendMeetingMessage(
    socket: Socket,
    userNo: number,
    messagePayload: SendMeetingDto,
  ) {
    const { location, time, chatRoomNo, meetingNo } = messagePayload;

    await this.checkMeetingExistence(meetingNo, chatRoomNo);
    await this.saveMessage({ chatRoomNo, userNo, meetingNo });

    socket.broadcast
      .to(`${chatRoomNo}`)
      .emit('message', { meeting: { location, time } });
  }

  private async checkMeetingExistence(meetingNo, chatRoomNo): Promise<void> {
    const meeting: Meetings =
      await this.meetingRepository.getMeetingByChatRoomAndMeetingNumber(
        meetingNo,
        chatRoomNo,
      );
    if (!meeting) {
      throw new NotFoundException(`해당하는 약속 정보를 찾을 수 없습니다.`);
    }
  }
}
