import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './common/configs/typeorm.config';
import { MeetingsModule } from './meetings/meetings.module';
import { BoardsModule } from './boards/boards.module';
import { NoticesModule } from './notices/notices.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { FriendsModule } from './friends/friends.module';
import { UniversitiesModule } from './universities/universities.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatsModule } from './chats/chats.module';
import { MannersModule } from './manners/manners.module';
import { AwsModule } from './aws/aws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncesModule } from './announces/announces.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MeetingsModule,
    BoardsModule,
    NoticesModule,
    UsersModule,
    ReportsModule,
    AnnouncesModule,
    FriendsModule,
    UniversitiesModule,
    EnquiriesModule,
    ChatsModule,
    MannersModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
