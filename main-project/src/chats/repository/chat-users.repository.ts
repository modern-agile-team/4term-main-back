import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatUsers } from '../entity/chat-users.entity';
import { ChatRoomList } from '../interface/chat.interface';

@EntityRepository(ChatUsers)
export class ChatUsersRepository extends Repository<ChatUsers> {
  async setRoomUsers(roomUsers): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
        .insert()
        .into(ChatUsers)
        .values(roomUsers)
        .execute();

      return raw.affectedRows;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 채팅방 유저 정보 설정(setRoomUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getChatRoomList(userNo: number): Promise<ChatRoomList[]> {
    try {
      const chatRoomList = await this.createQueryBuilder('chat_users')
        .leftJoin('chat_users.chatRoomNo', 'chatRoomNo')
        .select([
          'chatRoomNo.room_name AS roomName',
          'chat_users.chat_room_no AS chatRoomNo',
        ])
        .where('chat_users.user_no = :userNo', { userNo })
        .getRawMany();
      return chatRoomList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 채팅 목록 조회 (getChatRoomList): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
