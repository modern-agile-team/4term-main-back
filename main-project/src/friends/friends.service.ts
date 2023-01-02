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
  FriendInfo,
  FriendRequest,
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

  async createFriendRequest(createFriendDto: CreateFriendDto): Promise<void> {
    const { receiverNo, senderNo }: CreateFriendDto = createFriendDto;

    if (receiverNo === senderNo) {
      throw new BadRequestException('동일한 유저 번호입니다.');
    }

    const friendNo = await this.saveFriendRequest(createFriendDto);
  }

  private async saveFriendRequest(
    createFriendDto: CreateFriendDto,
  ): Promise<number> {
    const check: FriendRequestStatus = await this.friendsRepository.checkFriend(
      createFriendDto,
    );
    if (!check) {
      throw new InternalServerErrorException(`친구 신청에 실패했습니다.`);
    }
    if (check.isAccept === false) {
      throw new BadRequestException(
        `이미 친구 신청중이거나, 친구 신청을 받은 상태입니다.`,
      );
    }
    if (check.isAccept === true) {
      throw new BadRequestException(`이미 친구입니다.`);
    }

    const raw: FriendRequestResponse =
      await this.friendsRepository.createFriendRequest(createFriendDto);
    if (!raw.affectedRows) {
      throw new InternalServerErrorException(`friend request 생성 오류입니다.`);
    }

    return raw.insertId;
  }

  async acceptFriendRequest(friend: FriendRequest): Promise<void> {
    const { userNo, senderNo, friendNo } = friend;

    const friendRequest = await this.checkRequest({
      receiverNo: userNo,
      senderNo,
      friendNo,
    });

    if (friendRequest.isAccept === true) {
      throw new BadRequestException(`이미 친구입니다.`);
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

  // private async saveNoticeFriend(noticeFriend: NoticeFriend): Promise<void> {
  //   const { senderNo, receiverNo, friendNo }: NoticeFriend = noticeFriend;
  //   const type = NoticeType.FRIEND_REQUEST;

  //   const raw = await this.noticeRepository.saveNotice({
  //     type,
  //     userNo: senderNo,
  //     targetUserNo: receiverNo,
  //   });

  //   const result = await this.noticeFriendsRepository.saveNoticeFriend({
  //     noticeNo: raw.insertId,
  //     friendNo,
  //   });
  //   if (!result) {
  //     throw new BadRequestException('알람 생성에 실패하였습니다.');
  //   }
  // }

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

  async refuseRequest(refuseFriendNo: Friend): Promise<void> {
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

  private async refuseRequestByNo(refuseFriendNo: Friend): Promise<number> {
    const refuseResult = await this.friendsRepository.refuseRequestByNo(
      refuseFriendNo,
    );
    if (!refuseResult) {
      throw new BadRequestException('친구 요청 거절 오류입니다.');
    }

    return refuseResult;
  }

  private async checkRequest(
    friendDetail: Friend,
  ): Promise<FriendRequestStatus> {
    const friendRequest = await this.friendsRepository.checkRequest(
      friendDetail,
    );
    if (!friendRequest) {
      throw new NotFoundException('받은 요청이 없습니다.');
    }

    return friendRequest;
  }
}
