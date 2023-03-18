import { Logger, UseInterceptors, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseFilters, UseGuards, UsePipes } from '@nestjs/common/decorators';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { Namespace, Socket } from 'socket.io';
import { WebSocketAuthGuard } from 'src/common/guards/ws-jwt-auth.guard';
import { APIResponse } from 'src/common/interface/interface';
import { ChatsGatewayService } from './chats-gateway.service';
import { InitSocketDto } from './dto/init-socket.dto';
import { MessagePayloadDto } from './dto/message-payload.dto';
import { WebSocketGetUser } from 'src/common/decorator/ws-get-user.decorator';
import { WebSocketTransactionManager } from 'src/common/decorator/ws-transaction-manager.decorator';
import { WebSocketTransactionInterceptor } from 'src/common/interceptor/ws-transaction-interceptor';
import { EntityManager } from 'typeorm';
import { SendMeetingDto } from './dto/send-meeting.dto';
import { WebSocketExceptionFilter } from 'src/common/exceptions/ws-exception-filter';
import { number } from 'joi';

@WebSocketGateway(4000, {
  namespace: 'chat',
  cors: true,
})
@UsePipes(new ValidationPipe())
@UseFilters(new WebSocketExceptionFilter())
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
    description: `
    *소켓 초기화* 

    클라이언트
    소켓 초기화 socket auth 헤더 token으로 토큰 전달 
    
    서버
    [{ roomName: string, chatRoomNo: number, users:[{userNo:number, nickname:string, profileImage:string}] }] 반환`,
    channel: 'init-socket',
    message: {
      payload: InitSocketDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  async handleInitSocket(
    @WebSocketGetUser() userNo: number,
    @ConnectedSocket() socket: Socket,
  ): Promise<APIResponse> {
    const chatRooms = await this.chatGatewayService.initSocket(socket, userNo);

    return { response: { chatRooms } };
  }

  @SubscribeMessage('send-message')
  @AsyncApiSub({
    description: `
    *주의 서버로 보내는 이벤트는 send-message 서버에서 클라이언트로 받는 이벤트는 message*
    
    서버
    message이벤트로 emit하는 내용 
    채팅일때: 
    { "userNo": 1,
      "chatRoomNo": 3,
      "message": 3,
    }  

    이미지일때: 
    { "userNo": 1,
      "chatRoomNo": 3,
      "uploadedFileUrls": [
        "http",
        "http"
      ] 
    }`,
    channel: 'send-message',
    message: {
      payload: MessagePayloadDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  @UseInterceptors(WebSocketTransactionInterceptor)
  async handleSendMessage(
    @WebSocketGetUser() userNo: number,
    @WebSocketTransactionManager() manager: EntityManager,
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayloadDto,
  ): Promise<APIResponse> {
    messagePayload.hasOwnProperty('message')
      ? await this.chatGatewayService.sendChat(socket, messagePayload, userNo)
      : await this.chatGatewayService.sendFile(
          userNo,
          socket,
          messagePayload,
          manager,
        );
    return { response: { messagePayload } };
  }

  @SubscribeMessage('leave-room')
  @AsyncApiSub({
    description: `
    *채팅방 나가기*    
    
    클라이언트
    socket auth 헤더 token으로 토큰 전달 
    message body에 chatRoomNo 전달

    서버
    success: true, msg: 채팅방 나가기 완료`,
    channel: 'leave-room',
    message: {
      payload: MessagePayloadDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  async handleLeaveRoom(
    @WebSocketGetUser() userNo: number,
    @ConnectedSocket() socket: Socket,
    @MessageBody() { chatRoomNo }: MessagePayloadDto,
  ) {
    await this.chatGatewayService.leaveChatRoom(userNo, socket, chatRoomNo);

    return { msg: '채팅방 나가기 완료' };
  }

  @SubscribeMessage('send-meeting')
  @AsyncApiSub({
    description: `
    *약속 전송*

    클라이언트 
    socket auth 헤더 token으로 토큰 전달
    body로 약속정보 전달 (SendMeetingDto 참고)

    서버
    response: success: true반환 

    이벤트 message를 통해 
    meeting: { location: string, time:date } 전달`,
    channel: 'send-meeting',
    message: {
      payload: SendMeetingDto,
    },
  })
  @UseGuards(WebSocketAuthGuard)
  async handleSendMeeting(
    @WebSocketGetUser() userNo: number,
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: SendMeetingDto,
  ) {
    await this.chatGatewayService.sendMeetingMessage(
      socket,
      userNo,
      messagePayload,
    );
    return { success: true };
  }
}
