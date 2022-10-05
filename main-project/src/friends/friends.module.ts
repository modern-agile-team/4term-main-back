import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsRepository } from './repository/friends.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendsRepository])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
