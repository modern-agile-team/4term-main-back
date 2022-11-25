import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeFriendsRepository } from 'src/notices/repository/notices-friend.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendDetail,
  FriendInfo,
  FriendList,
  FriendRequest,
  FriendRequestResponse,
  NoticeFriend,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
    @InjectRepository(NoticesRepository)
    private readonly noticeRepository: NoticesRepository,
    @InjectRepository(NoticeFriendsRepository)
    private readonly noticeFriendsRepository: NoticeFriendsRepository,
  ) {}

  async createFriendRequest(createFriendDto: CreateFriendDto): Promise<void> {
    const { receiverNo, senderNo }: CreateFriendDto = createFriendDto;

    if (receiverNo === senderNo) {
      throw new BadRequestException('동일한 유저 번호입니다.');
    }

    const friendNo = await this.saveFriendRequest(createFriendDto);
    await this.saveNoticeFriend({ receiverNo, senderNo, friendNo });
  }

  async saveFriendRequest(createFriendDto: CreateFriendDto): Promise<number> {
    const check: FriendRequest = await this.friendsRepository.checkFriend(
      createFriendDto,
    );
    if (check) {
      if (check.isAccept == 0) {
        throw new BadRequestException(
          `이미 친구 신청중이거나, 친구 신청을 받은 상태입니다.`,
        );
      }
      if (check.isAccept == 1) {
        throw new BadRequestException(`이미 친구입니다.`);
      }
    }

    const raw: FriendRequestResponse =
      await this.friendsRepository.createFriendRequest(createFriendDto);
    if (!raw.affectedRows) {
      throw new InternalServerErrorException(`friend request 생성 오류입니다.`);
    }

    return raw.insertId;
  }

  async acceptFriendRequestByNoticeNo(noticeNo: number, userNo: number) {
    const check = await this.checkRequest({ friendNo: 1, senderNo: 2 });
  }

  async saveNoticeFriend(noticeFriend: NoticeFriend): Promise<void> {
    const { senderNo, receiverNo, friendNo }: NoticeFriend = noticeFriend;
    const type = NoticeType.FRIEND_REQUEST;

    const noticeNo = await this.noticeRepository.saveNoticeFriend({
      type,
      userNo: senderNo,
      targetUserNo: receiverNo,
    });

    const result = await this.noticeFriendsRepository.saveNoticeFriend({
      noticeNo,
      friendNo,
    });
    if (!result) {
      throw new BadRequestException('알람 생성에 실패하였습니다.');
    }
  }

  async acceptFriendRequest(
    receiverNo: number,
    senderNo: number,
  ): Promise<void> {
    const acceptFriend = await this.friendsRepository.acceptFriend(
      receiverNo,
      senderNo,
    );
    if (!acceptFriend) {
      throw new BadRequestException(`이미 친구이거나 잘못된 요청 입니다.`);
    }
  }

  async getAllReceiveFriendRequest(receiverNo: number): Promise<Friends[]> {
    const receivedRequestList = await this.findAllReceiveFriendReqByNo(
      receiverNo,
    );

    return receivedRequestList;
  }

  async getAllSendFriendRequest(senderNo: number): Promise<Friends[]> {
    const sendedRequestList = await this.findAllSendFriendReqByNo(senderNo);

    return sendedRequestList;
  }

  async getFriendList(userNo: number): Promise<FriendList[]> {
    const friendList = await this.findAllFriendByNo(userNo);

    return friendList;
  }

  async refuseRequest(refuseFriendNo: FriendDetail): Promise<void> {
    const { receiverNo, senderNo } = refuseFriendNo;
    if (receiverNo === senderNo) {
      throw new BadRequestException('유저 번호가 중복됩니다.');
    }

    const checkRequest = await this.checkRequest(refuseFriendNo);
    if (!checkRequest.isAccept) {
      await this.refuseRequestByNo(refuseFriendNo);
    }
  }

  async deleteFriend(deleteFriend: DeleteFriendDto): Promise<void> {
    const { userNo, friendNo }: DeleteFriendDto = deleteFriend;
    const receiverNo = userNo,
      senderNo = friendNo;
    if (userNo === friendNo) {
      throw new BadRequestException('유저 번호가 중복됩니다.');
    }

    await this.findFriendByNo({ receiverNo, senderNo });

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

  private async findAllFriendByNo(userNo: number): Promise<FriendList[]> {
    const friendList: FriendList[] =
      await this.friendsRepository.getAllFriendList(userNo);
    console.log(friendList);

    if (!friendList.length) {
      throw new BadRequestException('친구 목록이 없습니다.');
    }

    return friendList;
  }

  private async findFriendByNo(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    const friendRequest: FriendRequest =
      await this.friendsRepository.checkFriend(friendDetail);

    if (!friendRequest) {
      throw new BadRequestException('친구 목록에 없는 유저입니다.');
    }

    if (!friendRequest.isAccept) {
      throw new BadRequestException('친구 관계가 아닙니다.');
    }

    return friendRequest;
  }

  private async findAllReceiveFriendReqByNo(
    receiverNo: number,
  ): Promise<Friends[]> {
    const requestList: Friends[] =
      await this.friendsRepository.getAllReceiveFriendReq(receiverNo);

    if (!requestList.length) {
      throw new BadRequestException(`받은 친구 신청이 없습니다.`);
    }
    return requestList;
  }

  private async findAllSendFriendReqByNo(senderNo: number): Promise<Friends[]> {
    const requestList: Friends[] =
      await this.friendsRepository.getAllSendFriendReq(senderNo);
    if (!requestList.length) {
      throw new BadRequestException(`보낸 친구 신청이 없습니다.`);
    }

    return requestList;
  }
  private async refuseRequestByNo(
    refuseFriendNo: FriendDetail,
  ): Promise<number> {
    const refuseResult = await this.friendsRepository.refuseRequestByNo(
      refuseFriendNo,
    );
    if (!refuseResult) {
      throw new BadRequestException('친구 요청 거절 오류입니다.');
    }

    return refuseResult;
  }

  private async checkRequest(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    if (friendDetail.receiverNo && friendDetail.senderNo) {
      const checkRequest = await this.friendsRepository.checkRequest(
        friendDetail,
      );
      if (!checkRequest) {
        throw new BadRequestException('받은 요청이 없습니다.');
      }

      return checkRequest;
    }
    if (friendDetail.friendNo) {
      const checkRequest = await this.friendsRepository.checkRequestByFriendNo;
    }
  }
}
