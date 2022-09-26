import { Body, Controller, Post } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}
}
