import { InternalServerErrorException } from '@nestjs/common';
import { async } from 'rxjs';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';
import { ChatRoom, CreateChat } from '../interface/chat.interface';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  async checkRoomExist(meetingNo) {
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

  async getHostUserNickname(meetingNo) {
    try {
      const nickname = await this.createQueryBuilder('chat_list')
        .leftJoin('chat_list.meetingNo', 'meetingNo')
        .leftJoin('meetingNo.hostMembers', 'hostMembers')
        .leftJoin('hostMembers.userNo', 'hostUserNo')
        .select([
          'chat_list.room_name AS roomName',
          'hostUserNo.nickname AS hostUserNickname',
          // 'guestUserNo.nickname AS guestUserNickname',
        ])
        .where('chat_list.meeting_no = :meetingNo', { meetingNo })
        .getRawMany();

      return nickname;
    } catch (err) {
      throw err;
    }
  }

  async createRoom(createChat: CreateChat) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_list')
        .insert()
        .into(ChatList)
        .values(createChat)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(`${err}`);
    }
  }
}
