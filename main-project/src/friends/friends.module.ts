import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from './repository/friend.repository';
import { FriendReqListRepository } from './repository/friend-req-list.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendReqListRepository])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
