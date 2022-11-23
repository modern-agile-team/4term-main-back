import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeChats } from '../entity/notice-chat.entity';
import { NoticeChatsInfo } from '../interface/notice.interface';

@EntityRepository(NoticeChats)
export class NoticeChatsRepository extends Repository<NoticeChats> {
  async saveNoticeChat(noticeChatInfo: NoticeChatsInfo): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'notices_chats',
      )
        .insert()
        .into(NoticeChats)
        .values(noticeChatInfo)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅 알람 생성 에러(saveNoticeChat): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
