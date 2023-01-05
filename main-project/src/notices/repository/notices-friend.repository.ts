import { InternalServerErrorException } from '@nestjs/common';
import {
  Friend,
  NoticeFriend,
  NoticeUser,
} from 'src/friends/interface/friend.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeFriends } from '../entity/notice-friend.entity';

@EntityRepository(NoticeFriends)
export class NoticeFriendsRepository extends Repository<NoticeFriends> {
  async saveNoticeFriend(noticeFriend: NoticeFriend) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'notice_friends',
      )
        .insert()
        .into(NoticeFriends)
        .values(noticeFriend)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNoticeChats): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
  async getFriendNoByNoticeNo(noticeUser: NoticeUser): Promise<number> {
    try {
      const { friendNo }: Friend = await this.createQueryBuilder(
        'notice_friends',
      )
        .leftJoin('notice_friends.noticeNo', 'notice')
        .select(['notice_friends.friendNo AS friendNo'])
        .where(
          'notice_no = :noticeNo AND notice.targetUserNo = :userNo',
          noticeUser,
        )
        .getRawOne();

      return friendNo;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 친구 신청 번호 조회(getFriendNoByNoticeNo): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
