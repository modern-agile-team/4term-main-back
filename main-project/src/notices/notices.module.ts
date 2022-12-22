import { Module } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesRepository } from './repository/notices.repository';
import { NoticeChatsRepository } from './repository/notices-chats.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([NoticesRepository, NoticeChatsRepository]),
  ],
  providers: [NoticesService],
  controllers: [NoticesController],
})
export class NoticesModule {}
