import { InternalServerErrorException } from '@nestjs/common';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { FriendReqList } from '../entity/friend-req-list.entity';
import { FriendDetail, FriendRequest } from '../interface/friend.interface';

@EntityRepository(FriendReqList)
export class FriendReqListRepository extends Repository<FriendReqList> {
  async getAllFriendReq(userNo: number): Promise<FriendReqList[]> {
    try {
      const result = await this.createQueryBuilder('friend_req_list')
        .select([
          'friend_req_list.no AS no',
          'friend_req_list.request_user_no AS requestUserNo',
          'friend_req_list.accept_user_no AS acceptUserNo',
        ])
        .where('accept_user_no = :userNo', { userNo })
        .getRawMany();
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 신청 조회(getAllFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getFriendRequest(friendDetail: FriendDetail): Promise<FriendRequest> {
    try {
      const result: FriendRequest = await this.createQueryBuilder(
        'friend_req_list',
      )
        .select([
          'friend_req_list.no AS no',
          'friend_req_list.is_accept AS isAccept',
        ])
        .where(
          'request_user_no = :requestUserNo AND accept_user_no = :acceptUserNo',
          friendDetail,
        )
        .orWhere(
          'request_user_no = :acceptUserNo AND accept_user_no = :requestUserNo',
          friendDetail,
        )
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
        .into(FriendReqList)
        .values(friendDetail)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 요청 생성(createFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
