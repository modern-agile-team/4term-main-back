import { CacheModule, Module } from '@nestjs/common';
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
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatsModule } from './chats/chats.module';
import { MannersModule } from './manners/manners.module';
import { cacheModule } from './common/configs/redis.config';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MeetingsModule,
    BoardsModule,
    MembersModule,
    NoticesModule,
    UsersModule,
    ReportsModule,
    AnnouncementsModule,
    FriendsModule,
    UniversitiesModule,
    AuthModule,
    ProfileModule,
    EnquiriesModule,
    ChatsModule,
    MannersModule,
    cacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
