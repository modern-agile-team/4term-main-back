import { InternalServerErrorException } from '@nestjs/common';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  QueryResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Friends } from '../entity/friend.entity';
import {
  Friend,
  FriendDetail,
  FriendInfo,
  FriendList,
  FriendRequestResponse,
  FriendRequestStatus,
  FriendToSearch,
} from '../interface/friend.interface';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async getAllFriendList(userNo: number): Promise<FriendList[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .leftJoin('friends.receiverNo', 'receiverNo')
        .leftJoin('friends.senderNo', 'senderNo')
        .select([
          `IF(friends.receiver_no = ${userNo} , friends.sender_no, friends.receiver_no) AS friendNo`,
          `IF(friends.receiver_no = ${userNo} , senderNo.nickname, receiverNo.nickname) AS friendNickname`,
        ])
        .where('receiver_no = :userNo AND is_accept = 1', { userNo })
        .orWhere('sender_no = :userNo AND is_accept = 1', { userNo })
        .getRawMany();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 목록 조회(getAllFriendList): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllReceiveFriendReq(receiverNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.sender_no AS senderNo'])
        .where('receiver_no = :receiverNo', { receiverNo })
        .andWhere('is_accept = 0')
        .getRawMany();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 신청 조회(getAllReceiveFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllSendFriendReq(senderNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.receiver_no AS receiverNo'])
        .where('sender_no = :senderNo', { senderNo })
        .andWhere('is_accept = 0')
        .getRawMany();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 보낸 친구 신청 조회(getAllSendFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async checkFriend(friendDetail: FriendDetail): Promise<FriendRequestStatus> {
    try {
      const result: FriendRequestStatus = await this.createQueryBuilder(
        'friends',
      )
        .select(['friends.is_accept AS isAccept'])
        .where(
          'receiver_no = :receiverNo AND sender_no = :senderNo',
          friendDetail,
        )
        .orWhere(
          'receiver_no = :senderNo AND sender_no = :receiverNo',
          friendDetail,
        )
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 목록 조회(checkFriend): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async checkRequest(friendDetail: FriendDetail): Promise<FriendRequestStatus> {
    try {
      const result: FriendRequestStatus = await this.createQueryBuilder(
        'friends',
      )
        .select(['friends.is_accept AS isAccept'])
        .where(
          'receiver_no = :receiverNo AND sender_no = :senderNo',
          friendDetail,
        )
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 특정 친구 신청 목록 조회(checkRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async checkRequestByFriendNo(friendNo: number): Promise<FriendRequestStatus> {
    try {
      const result: FriendRequestStatus = await this.createQueryBuilder(
        'friends',
      )
        .select(['friends.is_accept AS isAccept'])
        .where('no = :friendNo', { friendNo })
        .getRawOne();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 특정 친구 신청 목록 조회(checkRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createFriendRequest(
    friendDetail: FriendDetail,
  ): Promise<FriendRequestResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Friends)
        .values(friendDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 신청 생성(createFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async acceptFriend(receiverNo: number, senderNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Friends)
        .set({ isAccept: 1 })
        .where('receiver_no = :receiverNo AND sender_no = :senderNo', {
          receiverNo,
          senderNo,
        })
        .andWhere('is_accept = 0')
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 수락(acceptFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async acceptFriendRequestByFriendNo(friendNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Friends)
        .set({ isAccept: 1 })
        .where('no = :friendNo', {
          friendNo,
        })
        .andWhere('is_accept = 0')
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 수락(acceptFriendRequestByFriendNo): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async deleteFriend(deleteFriend): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'friends',
      )
        .delete()
        .from(Friends)
        .where('receiver_no = :userNo AND sender_no = :friendNo', deleteFriend)
        .orWhere(
          'receiver_no = :friendNo AND sender_no = :userNo',
          deleteFriend,
        )
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 삭제(deleteFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async refuseRequestByNo(refuseFriendNo: FriendDetail): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Friends)
        .where(
          'receiver_no = :receiverNo AND sender_no = :senderNo',
          refuseFriendNo,
        )
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 거절(refuseRequestByNo): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
  async searchFriendByNickname({
    userNo,
    nickname,
  }: FriendToSearch): Promise<FriendInfo[]> {
    try {
      const friend = await this.createQueryBuilder('friends')
        .leftJoin('friends.receiverNo', 'receiverNo')
        .leftJoin('friends.senderNo', 'senderNo')
        .select([
          `IF(friends.receiver_no = ${userNo} , friends.sender_no, friends.receiver_no) AS friendNo`,
          `IF(friends.receiver_no = ${userNo} , senderNo.nickname, receiverNo.nickname) AS friendNickname`,
        ])
        .where(
          `friends.receiver_no = :userNo AND senderNo.nickname LIKE :nickname`,
          {
            nickname: `%${nickname}%`,
            userNo,
          },
        )
        .orWhere(
          `friends.senderNo = :userNo AND receiverNo.nickname LIKE :nickname`,
          {
            nickname: `%${nickname}%`,
            userNo,
          },
        )
        .getRawMany();

      return friend;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 검색(searchFriendByNickname): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
}
