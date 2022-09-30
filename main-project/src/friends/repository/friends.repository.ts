import { InternalServerErrorException } from '@nestjs/common';
import {
  EntityRepository,
  QueryResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Friends } from '../entity/friend.entity';
import { Friend, FriendDetail } from '../interface/friend.interface';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async getAllFriendList(userNo: Friend): Promise<Friends[]> {
    try {
      console.log(userNo);

      const result = await this.createQueryBuilder('friends')
        .select([
          'friends.no AS no',
          'friends.receiver_no AS receiverNo',
          'friends.sender_no AS senderNo',
        ])
        .where('receiver_no = :userNo AND is_accept = 1', { userNo })
        .orWhere('sender_no = :userNo AND is_accept = 1', { userNo })
        .getRawMany();

      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 목록 조회(getAllFriendList): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllFriendReq(receiverNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.no AS no', 'friends.sender_no AS senderNo'])
        .where('receiver_no = :receiverNo', { receiverNo })
        .getRawMany();
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 신청 조회(getAllFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async getAllSendedFriendReq(senderNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.no AS no', 'friends.receiver_no AS receiverNo'])
        .where('sender_no = :senderNo', { senderNo })
        .getRawMany();
      return result;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 보낸 친구 신청 조회(getAllSendedFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getFriendRequest(friendDetail: FriendDetail) {
    try {
      const result = await this.createQueryBuilder('friends')
        .select(['friends.no AS no', 'friends.is_accept AS isAccept'])
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
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 수락(acceptFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
}
