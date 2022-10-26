import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs';
import { send } from 'process';
import { DeleteResult, InsertResult } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendDetail,
  FriendList,
  FriendRequest,
  FriendRequestResponse,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async acceptFriendRequest(
    receiverNo: number,
    senderNo: number,
  ): Promise<object> {
    try {
      const acceptFriend = await this.friendsRepository.acceptFriend(
        receiverNo,
        senderNo,
      );
      if (!acceptFriend) {
        throw new BadRequestException(`이미 친구이거나 잘못된 요청 입니다.`);
      }

      return {
        success: true,
        msg: '친구 신청을 수락했습니다.',
      };
    } catch (err) {
      throw err;
    }
  }

  async getAllReceiveFriendRequest(receiverNo: number): Promise<object> {
    try {
      const requestList = await this.findAllReceiveFriendReqByNo(receiverNo);

      return requestList;
    } catch (err) {
      throw err;
    }
  }

  async getAllSendFriendRequest(senderNo: number): Promise<object> {
    try {
      const requestList = await this.findAllSendFriendReqByNo(senderNo);

      return requestList;
    } catch (err) {
      throw err;
    }
  }

  async createFriendRequest(createFriendDto: CreateFriendDto): Promise<object> {
    try {
      const { receiverNo, senderNo }: CreateFriendDto = createFriendDto;
      if (receiverNo === senderNo) {
        throw new BadRequestException('동일한 유저 번호입니다.');
      }

      const check: FriendRequest = await this.friendsRepository.checkFriend(
        createFriendDto,
      );
      if (!check) {
        const raw: FriendRequestResponse =
          await this.friendsRepository.createFriendRequest(createFriendDto);
        if (!raw.affectedRows) {
          throw new InternalServerErrorException(
            `friend request 생성 오류입니다.`,
          );
        }

        return {
          success: true,
          msg: '친구 신청이 완료되었습니다.',
        };
      }
      if (!check.isAccept) {
        throw new BadRequestException(
          `이미 친구 신청중이거나, 친구 신청을 받은 상태입니다.`,
        );
      } else {
        throw new BadRequestException(`이미 친구입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }

  async getFriendList(userNo: number): Promise<object> {
    try {
      const friendList = await this.findAllFriendByNo(userNo);

      return {
        success: true,
        friendList,
      };
    } catch (err) {
      throw err;
    }
  }

  async refuseRequest(refuseFriendNo: FriendDetail): Promise<void> {
    try {
      const { receiverNo, senderNo } = refuseFriendNo;
      if (receiverNo === senderNo) {
        throw new BadRequestException('유저 번호가 중복됩니다.');
      }

      const checkRequest = await this.checkRequest(refuseFriendNo);
      if (!checkRequest.isAccept) {
        await this.refuseRequestByNo(refuseFriendNo);
      }
    } catch (err) {
      throw err;
    }
  }

  async deleteFriend(deleteFriend: DeleteFriendDto): Promise<void> {
    try {
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
    } catch (err) {
      throw err;
    }
  }

  private async findAllFriendByNo(userNo: number): Promise<object> {
    try {
      const friendList: FriendList[] =
        await this.friendsRepository.getAllFriendList(userNo);
      if (!friendList.length) {
        throw new BadRequestException('친구 목록이 없습니다.');
      }

      return friendList;
    } catch (err) {
      throw err;
    }
  }

  private async findFriendByNo(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    try {
      const friendRequest: FriendRequest =
        await this.friendsRepository.checkFriend(friendDetail);

      if (!friendRequest) {
        throw new BadRequestException('친구 목록에 없는 유저입니다.');
      }

      if (!friendRequest.isAccept) {
        throw new BadRequestException('친구 관계가 아닙니다.');
      }

      return friendRequest;
    } catch (err) {
      throw err;
    }
  }

  private async findAllReceiveFriendReqByNo(
    receiverNo: number,
  ): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllReceiveFriendReq(receiverNo);

      if (!requestList.length) {
        throw new BadRequestException(`받은 친구 신청이 없습니다.`);
      }
      return requestList;
    } catch (err) {
      throw err;
    }
  }

  private async findAllSendFriendReqByNo(senderNo: number): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllSendFriendReq(senderNo);
      if (!requestList.length) {
        throw new BadRequestException(`보낸 친구 신청이 없습니다.`);
      }

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 보낸 전체 친구 신청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  private async refuseRequestByNo(
    refuseFriendNo: FriendDetail,
  ): Promise<number> {
    try {
      const refuseResult = await this.friendsRepository.refuseRequestByNo(
        refuseFriendNo,
      );
      if (!refuseResult) {
        throw new BadRequestException('친구 요청 거절 오류입니다.');
      }

      return refuseResult;
    } catch (err) {
      throw err;
    }
  }

  private async checkRequest(
    checkUserNo: FriendDetail,
  ): Promise<FriendRequest> {
    try {
      const checkRequestResult = await this.friendsRepository.checkRequest(
        checkUserNo,
      );
      if (!checkRequestResult) {
        throw new BadRequestException('받은 요청이 없습니다.');
      }

      return checkRequestResult;
    } catch (err) {
      throw err;
    }
  }
}
