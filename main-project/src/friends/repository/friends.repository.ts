import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { Friends } from '../entity/friend.entity';
import { FriendDetail } from '../interface/friend.interface';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async getAllFriendReq(userNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .select([
          'friends.no AS no',
          'friends.user_no AS userNo',
          'friends.friend_no AS friendNo',
        ])
        .where('user_no = :userNo', { userNo })
        .getRawMany();
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 신청 조회(getAllFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getFriendRequest(friendDetail: FriendDetail) {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.no AS no', 'friends.is_accept AS isAccept'])
        .where('user_no = :userNo AND friend_no = :friendNo', friendDetail)
        .orWhere('user_no = :friendNo AND friend_no = :userNo', friendDetail)
        .getRawOne();

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 특정 친구 요청 목록 조회(getFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createFriendRequest(friendDetail: FriendDetail) {
    try {
      const { raw }: UpdateResult = await this.createQueryBuilder()
        .insert()
        .into(Friends)
        .values(friendDetail)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 요청 생성(createFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async acceptFriend(userNo: number, friendNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Friends)
        .set({ isAccept: 1 })
        .where('user_no = :userNo AND friend_no = :friendNo', {
          userNo,
          friendNo,
        })
        .execute();
      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 수락(acceptFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
}
