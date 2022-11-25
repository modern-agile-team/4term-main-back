import { InternalServerErrorException } from '@nestjs/common';
import { NoticeFriend } from 'src/friends/interface/friend.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeFriends } from '../entity/notice-friend.entity';

@EntityRepository(NoticeFriends)
export class NoticeFriendsRepository extends Repository<NoticeFriends> {
  async saveNoticeFriend(noticeFriend: NoticeFriend) {
    try {
      console.log(noticeFriend);

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
}
