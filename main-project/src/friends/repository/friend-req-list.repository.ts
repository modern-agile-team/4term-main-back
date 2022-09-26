import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { FriendReqList } from '../entity/friend-req-list.entity';
import { FriendDetail, FriendRequest } from '../interface/friend.interface';

@EntityRepository(FriendReqList)
export class FriendReqListRepository extends Repository<FriendReqList> {
  async getFriendRequest(friendDetail: FriendDetail): Promise<FriendRequest> {
    try {
      const result: FriendRequest = await this.createQueryBuilder(
        'friend_req_list',
      )
        .select([
          'friend_req_list.no AS no',
          'friend_req_list.is_accept AS isAccept',
          // 'friend_req_list.request_user_no AS requestUserNo',
          // 'friend_req_list.accept_user_no AS acceptUserNo',
        ])
        .where(
          'request_user_no = :userNo AND accept_user_no = :friendNo',
          friendDetail,
        )
        .orWhere(
          'request_user_no = :friendNo AND accept_user_no = :userNo',
          friendDetail,
        )
        .getRawOne();
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 요청 목록 조회(getFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
