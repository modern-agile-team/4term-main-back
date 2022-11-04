import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatLog } from '../entity/chat-log.entity';
import { MessagePayload } from '../interface/chat.interface';

@EntityRepository(ChatLog)
export class ChatLogRepository extends Repository<ChatLog> {
  async saveMessage(messagePayload: MessagePayload) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ChatLog)
        .values(messagePayload)
        .execute();

      return raw.insertId;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 메세지 저장(saveMessage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getPreviousChatLog(chatRoomNo, currentChatLogNo): Promise<ChatLog[]> {
    try {
      const previousChatLog = await this.createQueryBuilder('chat_log')
        .select(['chat_log.*'])
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .andWhere(`chat_log.no < :currentChatLogNo`, { currentChatLogNo })
        .orderBy('no', 'DESC')
        .limit(30)
        .getRawMany();

      return previousChatLog;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 채팅로그 불러오기(getPreviousChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
