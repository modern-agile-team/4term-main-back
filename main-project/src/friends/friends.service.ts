import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeFriendsRepository } from 'src/notices/repository/notices-friend.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { CreateFriendRequestDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendInfo,
  FriendRequestValidation,
  FriendInsertResult,
  FriendRequestStatus,
  NoticeFriend,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async createFriendRequest(
    manager: EntityManager,
    createFriendDto: CreateFriendRequestDto,
  ): Promise<void> {
    const { senderNo, receiverNo }: CreateFriendRequestDto = createFriendDto;
    await this.checkRequest({
      senderNo,
      receiverNo,
      friendReqStatus: undefined,
    });

    const friendNo = await this.saveFriendRequest(manager, {
      senderNo,
      receiverNo,
    });
    await this.saveNoticeFriend(manager, { senderNo, receiverNo, friendNo });
  }

  private async saveFriendRequest(
    manager: EntityManager,
    createFriendDto: Friend,
  ): Promise<number> {
    const raw: FriendInsertResult = await manager
      .getCustomRepository(FriendsRepository)
      .createFriendRequest(createFriendDto);
    if (!raw.affectedRows) {
      throw new InternalServerErrorException(`friend request 생성 오류입니다.`);
    }
    return raw.insertId;
  }

  async acceptFriendRequest(
    friendRequest: FriendRequestValidation,
  ): Promise<void> {
    const { userNo, senderNo, friendNo } = friendRequest;

    const request = await this.checkRequest({
      receiverNo: userNo,
      senderNo,
      friendReqStatus: false,
    });
    if (request.friendNo !== friendNo) {
      throw new BadRequestException(`요청번호가 일치하지 않습니다.`);
    }

    await this.acceptFriendRequestByFriendNo(friendNo);
  }

  private async acceptFriendRequestByFriendNo(friendNo): Promise<void> {
    const affected = await this.friendsRepository.acceptFriendRequestByFriendNo(
      friendNo,
    );
    if (!affected) {
      throw new InternalServerErrorException(
        '친구 요청 수락에 실패하였습니다.',
      );
    }
  }

  private async saveNoticeFriend(
    manager: EntityManager,
    noticeFriend: NoticeFriend,
  ): Promise<void> {
    const { senderNo, receiverNo, friendNo }: NoticeFriend = noticeFriend;
    const type = NoticeType.FRIEND_REQUEST;

    const insertResult: FriendInsertResult = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        type,
        userNo: senderNo,
        targetUserNo: receiverNo,
      });

    const result = await manager
      .getCustomRepository(NoticeFriendsRepository)
      .saveNoticeFriend({
        noticeNo: insertResult.insertId,
        friendNo,
      });
    if (!result) {
      throw new BadRequestException('알람 생성에 실패하였습니다.');
    }
  }

  async getAllReceivedFriendRequest(receiverNo: number): Promise<Friends[]> {
    const receivedRequestList: Friends[] =
      await this.friendsRepository.getAllReceiveFriendReq(receiverNo);
    if (!receivedRequestList.length) {
      throw new NotFoundException(`받은 친구 신청이 없습니다.`);
    }

    return receivedRequestList;
  }

  async getAllSendedFriendRequest(senderNo: number): Promise<Friends[]> {
    const sendedRequestList: Friends[] =
      await this.friendsRepository.getAllSendFriendReq(senderNo);
    if (!sendedRequestList.length) {
      throw new NotFoundException(`보낸 친구 신청이 없습니다.`);
    }

    return sendedRequestList;
  }

  async getFriendList(userNo: number): Promise<Friend[]> {
    const friendList: Friend[] = await this.friendsRepository.getAllFriendList(
      userNo,
    );

    if (!friendList.length) {
      throw new NotFoundException('친구 목록이 없습니다.');
    }

    return friendList;
  }

  async refuseRequest(refuseFriendNo: FriendRequestValidation): Promise<void> {
    const { receiverNo, senderNo } = refuseFriendNo;
    if (receiverNo === senderNo) {
      throw new BadRequestException('유저 번호가 중복됩니다.');
    }

    await this.checkRequest({
      senderNo,
      receiverNo,
      friendReqStatus: false,
    });

    await this.refuseRequestByNo(refuseFriendNo);
  }

  async deleteFriend(deleteFriend: Friend): Promise<void> {
    const { userNo, friendNo, friendUserNo }: Friend = deleteFriend;

    const request: FriendRequestStatus = await this.checkRequest({
      receiverNo: userNo,
      senderNo: friendUserNo,
      friendReqStatus: true,
    });

    if (request.friendNo !== friendNo) {
      throw new BadRequestException(`요청번호가 일치하지 않습니다.`);
    }

    const deleteResult = await this.friendsRepository.deleteFriend(
      deleteFriend,
    );
    if (!deleteResult) {
      throw new BadRequestException('친구 삭제 오류입니다.');
    }
  }

  async searchFriend(nickname, userNo): Promise<FriendInfo[]> {
    const searchResult = await this.friendsRepository.searchFriendByNickname({
      nickname,
      userNo,
    });

    return searchResult;
  }

  private async findFriendByNo(
    friendDetail: Friend,
  ): Promise<FriendRequestStatus> {
    const friendRequest: FriendRequestStatus =
      await this.friendsRepository.checkFriend(friendDetail);

    if (!friendRequest) {
      throw new NotFoundException('친구 목록에 없는 유저입니다.');
    }

    if (!friendRequest.isAccept) {
      throw new BadRequestException('친구 관계가 아닙니다.');
    }

    return friendRequest;
  }

  private async refuseRequestByNo(refuseFriendNo: Friend): Promise<void> {
    const refuseResult = await this.friendsRepository.refuseRequestByNo(
      refuseFriendNo,
    );
    if (!refuseResult) {
      throw new BadRequestException('친구 요청 거절 오류입니다.');
    }
  }

  private async checkRequest(
    friendRequest: FriendRequestValidation,
  ): Promise<FriendRequestStatus> {
    const { friendReqStatus: isFriend }: FriendRequestValidation =
      friendRequest;
    const request: FriendRequestStatus =
      await this.friendsRepository.checkRequestByUsersNo(friendRequest);

    if (!request && isFriend === undefined) {
      return;
    }
    if (!request) {
      throw new NotFoundException(`친구 요청이 존재하지 않습니다.`);
    }

    if (Boolean(request.isAccept) === isFriend) {
      return request;
    }
    const error = request.isAccept
      ? new BadRequestException(`이미 친구인 상태입니다.`)
      : new BadRequestException(`친구 요청 대기중입니다.`);

    throw error;
  }
}
