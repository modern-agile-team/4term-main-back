import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
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
import { AwsService } from 'src/aws/aws.service';
import { ChatFileUrlsRepository } from './repository/chat-file-urls.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatListRepository,
      ChatUsersRepository,
      ChatLogRepository,
      ChatFileUrlsRepository,
      MeetingRepository,
      MeetingInfoRepository,
      NoticeChatsRepository,
      NoticesRepository,
      BoardRepository,
    ]),
  ],
  providers: [
    ChatsGateway,
    ChatsGatewayService,
    ChatsControllerService,
    AwsService,
  ],
  controllers: [ChatsController],
})
export class ChatsModule {}
