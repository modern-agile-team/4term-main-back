import { CacheModule, Module } from '@nestjs/common';
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
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatsModule } from './chats/chats.module';
import { MannersModule } from './manners/manners.module';
import { AwsModule } from './aws/aws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncesModule } from './announces/announces.module';
<<<<<<< HEAD
import { EventsModule } from './events/events.module';
=======
import { AuthModule } from './auth/auth.module';
import { cacheModule } from './common/configs/redis.config';
import { mailModule } from './common/configs/email.config';
>>>>>>> 060f0b01b0478687768072e3a53ecf63e371322a

@Module({
  imports: [
    CacheModule.register(),
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
    EnquiriesModule,
    ChatsModule,
    MannersModule,
    AwsModule,
<<<<<<< HEAD
    EventsModule,
=======
    AuthModule,
    cacheModule,
    mailModule,
>>>>>>> 060f0b01b0478687768072e3a53ecf63e371322a
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
