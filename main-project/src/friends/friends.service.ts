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
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendDetail,
  FriendInfo,
  FriendList,
  FriendRequestResponse,
  FriendRequestStatus,
  NoticeFriend,
  NoticeUser,
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

  async createFriendRequest(
    manager,
    createFriendDto: CreateFriendDto,
  ): Promise<void> {
    const { receiverNo, senderNo }: CreateFriendDto = createFriendDto;

    if (receiverNo === senderNo) {
      throw new BadRequestException('동일한 유저 번호입니다.');
    }

    const friendNo = await this.saveFriendRequest(manager, createFriendDto);
    await this.saveNoticeFriend(manager, { receiverNo, senderNo, friendNo });
  }

  private async saveFriendRequest(
    manager,
    createFriendDto: CreateFriendDto,
  ): Promise<number> {
    const check: FriendRequestStatus = await this.friendsRepository.checkFriend(
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

    const raw: FriendRequestResponse = await manager
      .getCustomRepository(FriendsRepository)
      .createFriendRequest(createFriendDto);

    if (!raw.affectedRows) {
      throw new InternalServerErrorException(`friend request 생성 오류입니다.`);
    }

    return raw.insertId;
  }

  async acceptFriendRequestByNoticeNo(
    noticeNo: number,
    userNo: number,
  ): Promise<void> {
    const friendNo = await this.getFriendNoByNoticeNo({ noticeNo, userNo });

    const check = await this.checkRequest({ friendNo });
    if (check.isAccept == 1) {
      throw new BadRequestException('이미 수락한 상태입니다.');
    }

    await this.acceptFriendRequestByFriendNo(friendNo);
  }

  private async acceptFriendRequestByFriendNo(friendNo): Promise<void> {
    const affected = await this.friendsRepository.acceptFriendRequestByFriendNo(
      friendNo,
    );
    if (!affected) {
      throw new BadRequestException('친구 요청 수락에 실패하였습니다.');
    }
  }

  private async getFriendNoByNoticeNo(noticeUser: NoticeUser): Promise<number> {
    const friendNo = await this.noticeFriendsRepository.getFriendNoByNoticeNo(
      noticeUser,
    );
    if (!friendNo) {
      throw new NotFoundException('친구요청이 존재하지 않습니다.');
    }

    return friendNo;
  }

  private async saveNoticeFriend(
    manager,
    noticeFriend: NoticeFriend,
  ): Promise<void> {
    const { senderNo, receiverNo, friendNo }: NoticeFriend = noticeFriend;
    const type = NoticeType.FRIEND_REQUEST;

    const raw = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        type,
        userNo: senderNo,
        targetUserNo: receiverNo,
      });
    const result = await manager
      .getCustomRepository(NoticeFriendsRepository)
      .saveNoticeFriend({
        noticeNo: raw.insertId,
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

  async getFriendList(userNo: number): Promise<FriendList[]> {
    const friendList: FriendList[] =
      await this.friendsRepository.getAllFriendList(userNo);

    if (!friendList.length) {
      throw new NotFoundException('친구 목록이 없습니다.');
    }

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

  private async findFriendByNo(
    friendDetail: FriendDetail,
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
  ): Promise<FriendRequestStatus> {
    if (friendDetail.receiverNo && friendDetail.senderNo) {
      const checkRequest = await this.friendsRepository.checkRequest(
        friendDetail,
      );
      if (!checkRequest) {
        throw new NotFoundException('받은 요청이 없습니다.');
      }

      return checkRequest;
    }
    if (friendDetail.friendNo) {
      const checkRequest = await this.friendsRepository.checkRequestByFriendNo(
        friendDetail.friendNo,
      );
      if (!checkRequest) {
        throw new NotFoundException('받은 요청이 없습니다.');
      }

      return checkRequest;
    }
  }
}
