import { InternalServerErrorException } from '@nestjs/common';
import { userInfo } from 'os';
import {
  ChatRoomInvitation,
  ChatUser,
} from 'src/chats/interface/chat.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeChats } from '../entity/notice-chat.entity';
import { Notices } from '../entity/notices.entity';
import { NoticeChatsInfo } from '../interface/notice.interface';
``;
@EntityRepository(NoticeChats)
export class NoticeChatsRepository extends Repository<NoticeChats> {
  async saveNoticeChat(noticeChatInfo: NoticeChatsInfo): Promise<number> {
    try {
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

  async getNotice(ChatRoomInvitation: ChatRoomInvitation): Promise<Notices> {
    try {
      const notice: Notices = await this.createQueryBuilder('notice_chats')
        .leftJoin('notice_chats.noticeNo', 'notices')
        .select(['notices.no as no '])
        .where(
          `notice_chats.chatRoomNo = :chatRoomNo 
          AND notices.userNo = :userNo AND notices.type = :type 
          AND notices.targetUserNo = :targetUserNo`,
          ChatRoomInvitation,
        )
        .getRawOne();

      return notice;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 채팅 알람 확인 에러(checkNoticeChat): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
