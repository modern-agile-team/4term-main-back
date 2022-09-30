import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { Friends } from './entity/friend.entity';
import { FriendDetail, FriendRequest } from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}
  async acceptFriendRequest(userNo: number, friendNo: number) {
    try {
      const acceptFriend = await this.friendsRepository.acceptFriend(
        userNo,
        friendNo,
      );
      if (!acceptFriend) {
        throw new BadRequestException(`잘못된 요청 정보입니다.`);
      }
    } catch (err) {
      throw err;
    }
  }
  async getFriendRequest(userNo: number) {
    try {
      const requestList = await this.findAllFriendReqByNo(userNo);

      if (!requestList[0]) {
        throw new BadRequestException(`친구신청한 유저가 없습니다.`);
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
        return check;
      }
      if (!check.isAccept) {
        throw new BadRequestException(`이미 친구신청이 완료되었습니다.`);
      }
    } catch (err) {
      throw err;
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
        `${err}: 친구 요청 확인(findFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async findAllFriendReqByNo(userNo: number): Promise<Friends[]> {
    try {
      const requestList: Friends[] =
        await this.friendsRepository.getAllFriendReq(userNo);

      return requestList;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err}: 전체 친구 요청 확인(findAllFriendReqByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
