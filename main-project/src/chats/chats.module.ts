import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { ChatsGateway } from './chats.gateway';
import { ChatService } from './chats.service';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';
import { ChatsController } from './chats.controller';
import { ChatLogRepository } from './repository/chat-log.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatListRepository,
      ChatUsersRepository,
      MeetingRepository,
      MeetingInfoRepository,
      ChatLogRepository,
    ]),
  ],
  providers: [ChatsGateway, ChatService],
  controllers: [ChatsController],
})
export class ChatsModule {}
