import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ChatsGatewayService } from './chats-gateway.service';
import {
  CreateChat,
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
  async handelInitSocket(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userNo: number,
  ) {
    try {
      await this.chatGatewayService.initSocket(socket, userNo);
    } catch (err) {
      throw err;
    }
  }

  @SubscribeMessage('create-room')
  async handelCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: CreateChat,
  ) {
    try {
      await this.chatGatewayService.createRoom(socket, messagePayload);

      return { success: true };
    } catch (err) {
      throw err;
    }
  }

  @SubscribeMessage('join-room')
  async handelJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: JoinChatRoom,
  ) {
    try {
      await this.chatGatewayService.joinRoom(socket, messagePayload);

      return { success: true };
    } catch (err) {
      throw err;
    }
  }

  @SubscribeMessage('message')
  async handelMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayload,
  ) {
    try {
      await this.chatGatewayService.sendChat(socket, messagePayload);
    } catch (err) {
      throw err;
    }
  }
}
