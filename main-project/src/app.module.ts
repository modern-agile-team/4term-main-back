import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './common/configs/typeorm.config';
import { MeetingsModule } from './meetings/meetings.module';
import { BoardsModule } from './boards/boards.module';
import { MembersModule } from './members/members.module';
import { NoticesModule } from './notices/notices.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { FriendsModule } from './friends/friends.module';
import { UniversitiesModule } from './universities/universities.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatsModule } from './chats/chats.module';
<<<<<<< HEAD
import { MannerTemperaturesModule } from './manners/manner-Temperatures.module';
=======
import { MannersModule } from './manners/manners.module';
>>>>>>> bf954ab93c9ee0d17c5b1dea2a4215ee9d0d2b0a

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MeetingsModule,
    BoardsModule,
    MembersModule,
    NoticesModule,
    UsersModule,
    ReportsModule,
    MannerTemperaturesModule,
    AnnouncementsModule,
    FriendsModule,
    UniversitiesModule,
    EnquiriesModule,
    ChatsModule,
    MannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
