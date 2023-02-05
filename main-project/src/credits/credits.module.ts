import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';
import { CreditsRepository } from './repository/credits.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CreditsRepository])],
  controllers: [CreditsController],
  providers: [CreditsService],
})
export class CreditsModule {}
