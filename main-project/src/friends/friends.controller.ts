import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  async createFriendRequest(@Body() createFriendDto: CreateFriendDto) {
    try {
      await this.friendsService.createFriendRequest(createFriendDto);

      return {
        success: true,
        msg: '친구신청이 완료 되었습니다.',
      };
    } catch (err) {
      throw err;
    }
  }
}
