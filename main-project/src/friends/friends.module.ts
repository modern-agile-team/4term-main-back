import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from './repository/friends.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { NoticeFriendsRepository } from 'src/notices/repository/notices-friend.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FriendsRepository,
      UsersRepository,
      NoticesRepository,
      NoticeFriendsRepository,
    ]),
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
