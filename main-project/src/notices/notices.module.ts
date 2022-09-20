import { Module } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesRepository } from './repository/notices.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NoticesRepository])],
  providers: [NoticesService, NoticesRepository],
  controllers: [NoticesController],
})
export class NoticesModule {}
