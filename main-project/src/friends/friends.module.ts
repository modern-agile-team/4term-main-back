import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from './repository/friends.repository';
import { UsersRepository } from 'src/users/repository/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendsRepository, UsersRepository])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
