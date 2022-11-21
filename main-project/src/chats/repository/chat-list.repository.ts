import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';
import { ChatRoomUsers, CreateChat } from '../interface/chat.interface';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  async checkRoomExistByMeetingNo(meetingNo): Promise<ChatList> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .select(['chat_list.meeting_no AS meetingNo'])
        .where(`meeting_no = :meetingNo`, { meetingNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createRoom(createChat: CreateChat): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_list')
        .insert()
        .into(ChatList)
        .values(createChat)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 생성 오류(createRoom): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async isUserInChatRoom(chatRoomNo, userNo): Promise<ChatRoomUsers> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .leftJoin('chat_list.chatUserNo', 'chatUserNo')
        .leftJoin('chatUserNo.userNo', 'userNo')
        .select([
          'chat_list.room_name AS roomName',
          'chat_list.no AS chatRoomNo',
          'chatUserNo.user_no AS userNo',
          'userNo.nickname AS nickname',
        ])
        .where(`chat_list.no = :chatRoomNo`, { chatRoomNo })
        .andWhere('chatUserNo.user_no = :userNo', { userNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 유저 확인 (isUserInChatRoom): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async checkRoomExistByChatNo(chatRoomNo): Promise<ChatList> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .select(['chat_list.no AS chatRoomNo'])
        .where(`no = :chatRoomNo`, { chatRoomNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
