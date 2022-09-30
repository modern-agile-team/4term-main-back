import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { DeleteFriendDto } from './dto/delete-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendDetail,
  FriendRequest,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}

  async acceptFriendRequest(receiverNo: number, senderNo: number) {
    try {
      const acceptFriend = await this.friendsRepository.acceptFriend(
        receiverNo,
        senderNo,
      );
      if (!acceptFriend) {
        throw new BadRequestException(`이미 친구이거나 잘못된 요청 입니다.`);
      }
      return {
        succese: true,
        msg: '친구 신청을 수락했습니다.',
      };
    } catch (err) {
      throw err;
    }
  }
  async getFriendRequest(receiverNo: number) {
    try {
      const requestList = await this.findAllFriendReqByNo(receiverNo);

      if (!requestList[0]) {
        throw new BadRequestException(`받은 친구 신청이 없습니다.`);
      }
      return requestList;
    } catch (err) {
      throw err;
    }
  }
  async getSendedFriendRequest(senderNo: number) {
    try {
      const requestList = await this.findAllSendedFriendReqByNo(senderNo);

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
      const check: FriendRequest = await this.findFriendReqByNo(
        createFriendDto,
      );

      if (!check) {
        const raw = await this.friendsRepository.createFriendRequest(
          createFriendDto,
        );

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
        throw new BadRequestException(`이미 신청중이거나, 받은 상태입니다.`);
      } else {
        throw new BadRequestException(`이미 친구입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }
  async getFriendList(userNo: Friend): Promise<any> {
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
  //삭제 로직
  //1.친구인지 확인
  // async deleteFriend({userNo, friendNo}: DeleteFriendDto): Promise<any> {

  // }
  private async findAllFriendByNo(userNo: Friend) {
    try {
      const friendList = await this.friendsRepository.getAllFriendList(userNo);

      return friendList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 목록 조회(findAllFriendByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  private async findFriendReqByNo(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    try {
      const friendRequest = await this.friendsRepository.getFriendRequest(
        friendDetail,
      );

      return friendRequest;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 친구 신청 확인(findFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async findAllFriendReqByNo(receiverNo: number): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllFriendReq(receiverNo);

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 받은 전체 친구 신청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  private async findAllSendedFriendReqByNo(
    senderNo: number,
  ): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllSendedFriendReq(senderNo);

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 보낸 전체 친구 신청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
