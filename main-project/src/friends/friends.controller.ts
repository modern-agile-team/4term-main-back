import { Body, Controller, Post } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async createFriendRequest(
    @Body() createFriendDto: CreateFriendDto,
  ): Promise<object> {
    const friendRequestNo: object =
      await this.friendsService.createFriendRequest(createFriendDto);
    return {
      success: true,
      friendRequestNo,
    };
  }
}
