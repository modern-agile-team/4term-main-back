import { Logger } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { APIResponse } from 'src/common/interface/interface';
import { ChatsGatewayService } from './chats-gateway.service';
import { CreateChatDto } from './dto/create-chat.dto';
import {
  ChatRoomList,
  JoinChatRoom,
  MessagePayload,
} from './interface/chat.interface';

@WebSocketGateway(4000, { namespace: 'chat' })
export class ChatsGateway {
  constructor(private readonly chatGatewayService: ChatsGatewayService) {}

  private logger = new Logger('GateWay');

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.nsp.adapter.on('init-socket', (room, id) => {
      this.logger.log(`"Socket:${id}"초기화 되었습니다.`);
    });

    this.nsp.adapter.on('join-room', (room, id) => {
      this.logger.log(`"Socket:${id}"이 "Room:${room}"에 참여하였습니다.`);
    });

    this.nsp.adapter.on('leave-room', (room, id) => {
      this.logger.log(`"Socket:${id}"이 "Room:${room}"에서 나갔습니다.`);
    });

    this.nsp.adapter.on('delete-room', (roomName) => {
      this.logger.log(`"Room:${roomName}"이 삭제되었습니다.`);
    });

    this.logger.log('웹소켓 서버 초기화');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓연결`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`${socket.id} 소켓연결 해제`);
  }

  @SubscribeMessage('init-socket')
  async handleInitSocket(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userNo: number,
  ): Promise<APIResponse> {
    const chatRoomList: ChatRoomList[] =
      await this.chatGatewayService.initSocket(socket, userNo);

    return { response: { chatRoomList } };
  }

  @ApiOperation({
    summary: '소켓 채팅방 생성',
    description: '닉네임의 조합으로 생성',
  })
  @SubscribeMessage('create-room')
  async handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: CreateChatDto,
  ): Promise<void> {
    await this.chatGatewayService.createRoom(socket, messagePayload);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: JoinChatRoom,
  ): Promise<APIResponse> {
    const recentChatLog = await this.chatGatewayService.joinRoom(
      socket,
      messagePayload,
    );

    return { response: { recentChatLog } };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayload,
  ): Promise<void> {
    messagePayload.hasOwnProperty('message')
      ? await this.chatGatewayService.sendChat(socket, messagePayload)
      : await this.chatGatewayService.sendFile(socket, messagePayload);
  }
}
