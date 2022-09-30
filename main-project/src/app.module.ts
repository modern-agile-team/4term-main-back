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
<<<<<<< HEAD
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
=======
import { EnquiriesModule } from './enquiries/enquiries.module';
>>>>>>> d2696e59d37f37ce4d67441bc70a0db7637cf97f

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
    AnnouncementsModule,
    FriendsModule,
    UniversitiesModule,
<<<<<<< HEAD
    AuthModule,
    ProfileModule,
=======
    EnquiriesModule,
>>>>>>> d2696e59d37f37ce4d67441bc70a0db7637cf97f
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
