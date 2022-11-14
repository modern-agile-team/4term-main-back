import { InternalServerErrorException } from '@nestjs/common';
import { async } from 'rxjs';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatUsers } from '../entity/chat-users.entity';
import { ChatRoomList, ChatUserInfo } from '../interface/chat.interface';

@EntityRepository(ChatUsers)
export class ChatUsersRepository extends Repository<ChatUsers> {
  async setRoomUsers(roomUsers): Promise<InsertResult> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
        .insert()
        .into(ChatUsers)
        .values(roomUsers)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 유저 정보 설정(setRoomUsers): 알 수 없는 서버 에러입니다.`,
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
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅 목록 조회 (getChatRoomList): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async checkUserInChatRoom(chatUserInfo: ChatUserInfo): Promise<ChatUserInfo> {
    try {
      const user: ChatUserInfo = await this.createQueryBuilder('chat_users')
        .select([
          'chat_users.user_no AS userNo',
          'chat_users.chat_room_no AS chatRoomNo',
        ])
        .where('user_no = :userNo AND chat_room_no = :chatRoomNo', chatUserInfo)
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 유저 정보 조회(checkUserInChatRoom): 알 수 없는 서버 에러입니다`,
      );
    }
  }

  async inviteUserByUserNo(chatUserInfo: ChatUserInfo): Promise<InsertResult> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
        .insert()
        .into(ChatUsers)
        .values(chatUserInfo)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유처 초대(inviteUserByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
