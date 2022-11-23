import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MannersTemperatureController } from './manner-Temperatures.controller';
import { MannerTemperaturesService } from './manner-Temperatures.service';
import { MannerTemperatureRepository } from './repository/manner-Temperatures.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MannerTemperatureRepository])],

  controllers: [MannersTemperatureController],
  providers: [MannerTemperaturesService],
})
export class MannerTemperaturesModule {}
