import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { MessagePayloadDto } from '../dto/message-payload.dto';
import { ChatLog } from '../entity/chat-log.entity';
import { ChatMessage } from '../interface/chat.interface';

@EntityRepository(ChatLog)
export class ChatLogRepository extends Repository<ChatLog> {
  async saveMessage(messagePayload: ChatMessage): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ChatLog)
        .values(messagePayload)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 메세지 저장(saveMessage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getPreviousChatLog(
    chatRoomNo: number,
    currentChatLogNo: number,
  ): Promise<ChatLog[]> {
    try {
      const previousChatLog = await this.createQueryBuilder('chat_log')
        .leftJoin('chat_log.userNo', 'user')
        .leftJoin('chat_log.chatFileUrl', 'chatFileUrl')
        .leftJoin('chat_log.meetingNo', 'meeting')
        .select([
          'chat_log.no AS chatLogNo',
          'user.no AS userNo',
          'chat_log.sended_time AS sendedTime',
        ])
        .addSelect(
          `CASE 
      WHEN chat_log.message IS NOT NULL THEN chat_log.message 
      WHEN chat_log.meetingNo IS NOT NULL THEN CONCAT(meeting.location, '/', meeting.time) 
      ELSE GROUP_CONCAT(chatFileUrl.fileUrl SEPARATOR ', ') END`,
          `field`,
        )
        .addSelect(
          `CASE 
        WHEN chat_log.message IS NOT NULL THEN 'Message' 
        WHEN chat_log.meetingNo IS NOT NULL THEN 'Meeting' 
        ELSE 'ImageUrl' END`,
          `type`,
        )
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .andWhere(`chat_log.no < :currentChatLogNo`, { currentChatLogNo })
        .groupBy('chat_log.no')
        .orderBy('chat_log.no', 'DESC')
        .limit(30)
        .getRawMany();

      return previousChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getPreviousChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getCurrentChatLog(chatRoomNo: number): Promise<ChatLog[]> {
    try {
      const currentChatLog: ChatLog[] = await this.createQueryBuilder(
        'chat_log',
      )
        .leftJoin('chat_log.userNo', 'user')
        .leftJoin('chat_log.chatFileUrl', 'chatFileUrl')
        .leftJoin('chat_log.meetingNo', 'meeting')
        .select([
          'chat_log.no AS chatLogNo',
          'user.no AS userNo',
          'chat_log.sended_time AS sendedTime',
        ])
        .addSelect(
          `CASE 
        WHEN chat_log.message IS NOT NULL THEN chat_log.message 
        WHEN chat_log.meetingNo IS NOT NULL THEN CONCAT(meeting.location, '/', meeting.time) 
        ELSE GROUP_CONCAT(chatFileUrl.fileUrl SEPARATOR ', ') END`,
          `field`,
        )
        .addSelect(
          `CASE 
          WHEN chat_log.message IS NOT NULL THEN 'Message' 
          WHEN chat_log.meetingNo IS NOT NULL THEN 'Meeting' 
          ELSE 'ImageUrl' END`,
          `type`,
        )
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .groupBy('chat_log.no')
        .orderBy('chat_log.no', 'DESC')
        .limit(30)
        .getRawMany();

      return currentChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getPreviousChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getRecentChatLog(chatRoomNo: number): Promise<ChatLog[]> {
    try {
      const recentChatLog = await this.createQueryBuilder('chat_log')
        .select(['chat_log.*'])
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .orderBy('no', 'DESC')
        .limit(30)
        .getRawMany();

      return recentChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getRecentChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
