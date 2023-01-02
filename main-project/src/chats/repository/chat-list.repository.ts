import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';
import { ChatRoomUser, CreateChat } from '../interface/chat.interface';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  async checkRoomExistByBoardNo(boardNo: number): Promise<ChatList> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .select(['chat_list.board_no AS boardNo'])
        .where(`board_no = :boardNo`, { boardNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createChatRoom(createChat: CreateChat): Promise<number> {
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

  async isUserInChatRoom(
    chatRoomNo: number,
    userNo: number,
  ): Promise<ChatRoomUser> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .leftJoin('chat_list.chatUserNo', 'chatUser')
        .leftJoin('chatUser.userNo', 'user')
        .leftJoin('user.userProfileNo', 'userProfile')
        .select([
          'chat_list.room_name AS roomName',
          'chat_list.no AS chatRoomNo',
          'chatUser.user_no AS userNo',
          'userProfile.nickname AS nickname',
        ])
        .where(`chat_list.no = :chatRoomNo`, { chatRoomNo })
        .andWhere('chatUser.user_no = :userNo', { userNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 유저 확인 (isUserInChatRoom): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async checkRoomExistsByChatRoomNo(chatRoomNo: number): Promise<ChatList> {
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
