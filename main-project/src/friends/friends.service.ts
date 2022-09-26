import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { Friends } from './entity/friend.entity';
import {
  FriendDetail,
  FriendRequestDetail,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friend.repository';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsRepository)
    private readonly friendsRepository: FriendsRepository,
  ) {}
}
