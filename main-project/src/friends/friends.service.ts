import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs';
import { InsertResult } from 'typeorm';
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
      if (!requestList[0]) {
        throw new BadRequestException(`받은 친구 신청이 없습니다.`);
      }

      return requestList;
    } catch (err) {
      throw err;
    }
  }

  async getSendFriendRequest(senderNo: number): Promise<object> {
    try {
      const requestList = await this.findAllSendFriendReqByNo(senderNo);
      if (!requestList[0]) {
        throw new BadRequestException(`보낸 친구 신청이 없습니다.`);
      }

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
      const check: FriendRequest = await this.findFriendByNo(createFriendDto);

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

  async getFriendList(userNo: Friend): Promise<object> {
    try {
      const friendList = await this.findAllFriendByNo(userNo);
      if (!friendList) {
        throw new BadRequestException('친구 목록이 없습니다.');
      }

      return {
        success: true,
        friendList,
      };
    } catch (err) {
      throw err;
    }
  }

  async deleteFriend(deleteFriendDto: DeleteFriendDto) {
    try {
      const { userNo, friendNo }: FriendDetail = deleteFriendDto;
      if (userNo === friendNo) {
        throw new BadRequestException('유저 번호가 중복됩니다.');
      }
      const a = await this.findFriendByNo({ userNo, friendNo });
      return a;
    } catch (err) {
      throw err;
    }
  }

  private async findAllFriendByNo(userNo: Friend): Promise<object> {
    try {
      const friendList: FriendList[] =
        await this.friendsRepository.getAllFriendList(userNo);

      return friendList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 목록 조회(findAllFriendByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async findFriendByNo(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    try {
      const friendRequest: FriendRequest =
        await this.friendsRepository.checkFriend(friendDetail);

      return friendRequest;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 신청 확인(findFriendByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async findAllReceiveFriendReqByNo(
    receiverNo: number,
  ): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllReceiveFriendReq(receiverNo);

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 받은 전체 친구 신청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async findAllSendFriendReqByNo(senderNo: number): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllSendFriendReq(senderNo);

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 보낸 전체 친구 신청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
