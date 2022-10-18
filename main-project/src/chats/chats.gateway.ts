import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { timestamp } from 'rxjs';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from './chats.service';
import { MessagePayload } from './interface/chat.interface';
import * as serviceAccount from './path/to/serviceAccountKey.json';

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// initializeApp({
//   credential: cert(serviceAccount),
// });
// let createdRooms: string[] = [];
// const db = getFirestore();

@WebSocketGateway(4000, { namespace: 'chat' })
export class ChatsGateway {
  constructor(private readonly chatService: ChatService) {}

  private logger = new Logger('GateWay');

  @WebSocketServer() nsp: Namespace;
  afterInit() {
    this.nsp.adapter.on('create-room', (room) => {
      this.logger.log(`"Room:${room}"이 생성되었습니다.`);
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

  @SubscribeMessage('create-room')
  async handelCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() messagePayload: MessagePayload,
  ) {
    await this.chatService.createRoom(socket, messagePayload);

    return { success: true };
    // const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
    // if (exists) {
    //   this.logger.log(`${roomName} 방이 이미 존재합니다.`);
    //   return { success: false, msg: `${roomName} 방이 이미 존재합니다.` };
    // }
    // socket.join(roomName); // 기존에 없던 room으로 join하면 room이 생성됨
    // createdRooms.push(roomName); // 유저가 생성한 room 목록에 추가

    // this.nsp.emit('create-room', roomName); // 대기실 방 생성

    // const chatRoomRef = db
    //   .collection(`${Object.values(roomName)}`)
    //   .doc('memberList');
    // console.log(roomName);

    // const getCol = await chatRoomRef.get();
    // await docRef.set({
    //   aaa: socket.id,
    // });
  }

  @SubscribeMessage('ClientToServer')
  async handelMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ) {
    socket.broadcast.emit('message', { username: socket.id, message });
    return { username: socket.id, message };
  }
}
