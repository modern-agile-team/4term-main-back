import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { EnquirysRepository } from './repository/enquiry.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EnquirysRepository])],
  controllers: [EnquiriesController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
