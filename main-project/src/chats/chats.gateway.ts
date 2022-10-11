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
import * as serviceAccount from './path/to/serviceAccountKey.json';

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

@WebSocketGateway(4000, { namespace: 'chat' })
export class ChatsGateway {
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
    @MessageBody() roomName: string,
  ) {
    const chatRoomRef = db
      .collection(`${Object.values(roomName)}`)
      .doc('memberList');
    const getCol = await chatRoomRef.get();
    // await docRef.set({
    //   aaa: socket.id,
    // });
    console.log(getCol.exists);
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
