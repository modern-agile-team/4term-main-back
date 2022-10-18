import { InternalServerErrorException } from '@nestjs/common';
import { async } from 'rxjs';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';
import { CreateChat } from '../interface/chat.interface';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  async checkRoomExist(roomName) {
    try {
      console.log(1);

      const result = await this.createQueryBuilder('chat_list')
        .select(['chat_list.room_name AS room_name'])
        .where(`room_name = :roomName`, { roomName })
        .getRawOne();
      console.log(2);

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 채팅방 중복 확인 (checkRoomExist): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserNickname(meetingNo) {
    try {
      // const nickname = await this.createQueryBuilder('');
    } catch (err) {}
  }

  async createRoom(createChat: CreateChat) {
    try {
      console.log(4);
      console.log(createChat);

      const raw = await this.createQueryBuilder('chat_list')
        .insert()
        .into(ChatList)
        .values(createChat)
        .execute();

      console.log(7);

      console.log(raw);

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(`${err}`);
    }
  }
}
