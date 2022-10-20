import { InternalServerErrorException } from '@nestjs/common';
import { async } from 'rxjs';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';
import { ChatRoom, CreateChat } from '../interface/chat.interface';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  async checkRoomExist(meetingNo): Promise<ChatList> {
    try {
      const result = await this.createQueryBuilder('chat_list')
        .select(['chat_list.meeting_no AS meetingNo'])
        .where(`meeting_no = :meetingNo`, { meetingNo })
        .getRawOne();

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
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
    } catch (err) {
      throw new InternalServerErrorException(`${err}`);
    }
  }

  // async isUserInChatRoom(meetingNo, userNo) {
  //   try {
  //     // const result = await this.createQueryBuilder('chat_list')
  //     //   .select(['chat_list.meeting_no AS meetingNo',])
  //     //   .where(`meeting_no = :meetingNo`, { meetingNo })
  //     //   .andWhere()
  //     //   .getRawOne();
  //     // return result;
  //   } catch (err) {
  //     throw new InternalServerErrorException(
  //       `${err}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
  //     );
  //   }
  // }
}
