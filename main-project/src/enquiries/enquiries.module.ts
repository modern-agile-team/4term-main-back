import { Module } from '@nestjs/common';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';

@Module({
  controllers: [EnquiriesController],
  providers: [EnquiriesService]
})
export class EnquiriesModule {}
