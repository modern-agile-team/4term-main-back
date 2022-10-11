import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsGateway } from './chats.gateway';
import { ChatListRepository } from './repository/chat-list.repository';
@Module({
  imports: [TypeOrmModule.forFeature([ChatListRepository])],
  providers: [ChatsGateway],
})
export class ChatsModule {}
