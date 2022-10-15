import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MannerTemperatureReadResponse } from './interface/manner-Temperatures.interface';
import { MannerTemperatureRepository } from './repository/manner-Temperatures.repository';

@Injectable()
export class MannerTemperaturesService {
  constructor(
    @InjectRepository(MannerTemperatureRepository)
    private readonly MannerRepository: MannerTemperatureRepository,
  ) {}
  // 매너온도 조회
  async getMannerTemperatureByNo(
    userProfileNo: number,
  ): Promise<MannerTemperatureReadResponse> {
    try {
      const Temperature = await this.MannerRepository.getMannerTemperatureByNo(
        userProfileNo,
      );

      if (!Temperature) {
        throw new NotFoundException(
          `${userProfileNo}번 매너온도를 찾을 수 없습니다.`,
        );
      }

      return Temperature;
    } catch (error) {
      throw error;
    }
  }

  // 매너온도 생성
  async createMannerTemperature(userProfileNo: number): Promise<number> {
    try {
      const { affectedRows, insertId } =
        await this.MannerRepository.createMannerTemperature(userProfileNo);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }
}
