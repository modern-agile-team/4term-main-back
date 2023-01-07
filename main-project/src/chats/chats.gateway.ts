import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AsyncApiPub, AsyncApiSub } from 'nestjs-asyncapi';
import { Namespace, Socket } from 'socket.io';
import { APIResponse } from 'src/common/interface/interface';
import { ChatsGatewayService } from './chats-gateway.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { InitSocketDto } from './dto/init-socket.dto';
import { JoinChatRoomDto } from './dto/join-chat.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { ChatRoomList } from './interface/chat.interface';

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
  @AsyncApiSub({
    description: `소켓 초기화 
    response: [{ roomName: string, chatRoomNo: number }] 반환`,
    channel: 'init-socket',
    message: {
      payload: InitSocketDto,
    },
  })
  async handleInitSocket(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: InitSocketDto,
  ): Promise<APIResponse> {
    const chatRoomList: ChatRoomList[] =
      await this.chatGatewayService.initSocket(socket, messagePayload);

    return { response: { chatRoomList } };
  }

  /**
   *
   * @todo: 채팅방 생성시 softdelete 구분
   */
  @SubscribeMessage('create-room')
  @AsyncApiSub({
    description: `채팅방 생성 
    response: { chatRoomNo: number } 반환`,
    channel: 'create-room',
    message: {
      payload: CreateChatDto,
    },
  })
  async handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: CreateChatDto,
  ): Promise<APIResponse> {
    const chatRoomNo = await this.chatGatewayService.createRoom(
      socket,
      messagePayload,
    );
    return { response: { chatRoomNo } };
  }

  @SubscribeMessage('join-room')
  @AsyncApiSub({
    description: `채팅방 참여 
    response: { chatRoomNo: number } 반환`,
    channel: 'join-room',
    message: {
      payload: JoinChatRoomDto,
    },
  })
  async handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: JoinChatRoomDto,
  ): Promise<APIResponse> {
    const recentChatLog = await this.chatGatewayService.joinRoom(
      socket,
      messagePayload,
    );

    return { response: { recentChatLog } };
  }

  @SubscribeMessage('message')
  @AsyncApiSub({
    description: `
    메세지 전송 채팅일때 response: 
    { "userNo": 1,
      "chatRoomNo": 3,
      "message": 3,
    }  
    이미지일때 
    { "userNo": 1,
      "chatRoomNo": 3,
      "uploadedFileUrls": [
        "http",
        "http"
      ] 
    }반환`,
    channel: 'message',
    message: {
      payload: MessagePayloadDto,
    },
  })
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayloadDto,
  ): Promise<APIResponse> {
    messagePayload.hasOwnProperty('message')
      ? await this.chatGatewayService.sendChat(socket, messagePayload)
      : await this.chatGatewayService.sendFile(socket, messagePayload);
    return { response: { messagePayload } };
  }
}
