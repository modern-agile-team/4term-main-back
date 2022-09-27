import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendDetail, FriendRequest } from './interface/friend.interface';
import { FriendReqListRepository } from './repository/friend-req-list.repository';
import { FriendsRepository } from './repository/friend.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendReqListRepository)
    private readonly friendsRepository: FriendReqListRepository,
  ) {}

  async createFriendRequest(createFriendDto: CreateFriendDto): Promise<object> {
    try {
      const check: FriendRequest = await this.findFriendReqByNo(
        createFriendDto,
      );

      if (!check.isAccept) {
        throw new BadRequestException(`이미 친구신청이 완료되었습니다.`);
      }

      const raw = await this.friendsRepository.createFriendRequest(
        createFriendDto,
      );

      if (!raw.affectedRows) {
        throw new InternalServerErrorException(
          `friend request 생성 오류입니다.`,
        );
      }

      return check;
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
}
