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
<<<<<<< HEAD
import { AnnouncementsModule } from './announcements/announcements.module';
=======
import { FriendsModule } from './friends/friends.module';
import { UniversitiesModule } from './universities/universities.module';
>>>>>>> 0e3dd7be5ca4f272af741654a516abbac6029316

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
<<<<<<< HEAD
    AnnouncementsModule,
=======
    FriendsModule,
    UniversitiesModule,
>>>>>>> 0e3dd7be5ca4f272af741654a516abbac6029316
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
