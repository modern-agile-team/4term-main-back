import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { ChatsGateway } from './chats.gateway';
import { ChatService } from './chats.service';
import { ChatListRepository } from './repository/chat-list.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatListRepository,
      MeetingRepository,
      MeetingInfoRepository,
    ]),
  ],
  providers: [ChatsGateway, ChatService],
})
export class ChatsModule {}
