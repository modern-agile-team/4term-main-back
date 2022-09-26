import { Injectable } from '@nestjs/common';
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
  /**
   *
   * @param createFriendDto 친구 요청
   * 1. 요청이 넘어오면 친구 userID의 friendNo 가 존재하는 지 확인
   * 2. 존재하면 return 이미 친구
   * 3. 없으면 friendRequest 생성
   */
  async createFriendRequest(createFriendDto: CreateFriendDto): Promise<object> {
    try {
      const { userNo, friendNo }: CreateFriendDto = createFriendDto;

      const check: FriendRequest = await this.findFriendById({
        userNo,
        friendNo,
      });
      console.log(check.no);

      return check;
    } catch {}
  }

  private async findFriendById(
    friendDetail: FriendDetail,
  ): Promise<FriendRequest> {
    try {
      const friendRequest = await this.friendsRepository.getFriendRequest(
        friendDetail,
      );
      return friendRequest;
    } catch {}
  }
}
