import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeChats } from '../entity/notice-chat.entity';
import { NoticeChatsInfo } from '../interface/notice.interface';
``;
@EntityRepository(NoticeChats)
export class NoticeChatsRepository extends Repository<NoticeChats> {
  async saveNoticeChat(noticeChatInfo: NoticeChatsInfo): Promise<number> {
    try {
      console.log(noticeChatInfo);

      const { raw }: InsertResult = await this.createQueryBuilder(
        'notice_chats',
      )
        .insert()
        .into(NoticeChats)
        .values(noticeChatInfo)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅 알람 생성 에러(saveNoticeChat): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async checkNoticeChat(
    targetUserNo: number,
    chatRoomNo: number,
    type: number,
  ): Promise<NoticeChats> {
    try {
      const noticeChat = await this.createQueryBuilder('notice_chats')
        .leftJoin('notice_chats.noticeNo', 'notices')
        .select(['notices.* '])
        .where('notices.type = :type', { type })
        .andWhere('notices.target_user_no = :targetUserNo', { targetUserNo })
        .andWhere('notice_chats.chat_room_no = :chatRoomNo', { chatRoomNo })
        .getRawOne();

      return noticeChat;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 채팅 알람 확인 에러(checkNoticeChat): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
