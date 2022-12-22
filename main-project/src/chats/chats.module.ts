import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { ChatsGateway } from './chats.gateway';
import { ChatsGatewayService } from './chats-gateway.service';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';
import { ChatsController } from './chats.controller';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatsControllerService } from './chats-controller.service';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { BoardRepository } from 'src/boards/repository/board.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatListRepository,
      ChatUsersRepository,
      MeetingRepository,
      ChatLogRepository,
      NoticeChatsRepository,
      NoticesRepository,
      BoardRepository,
    ]),
  ],
  providers: [ChatsGateway, ChatsGatewayService, ChatsControllerService],
  controllers: [ChatsController],
})
export class ChatsModule {}
