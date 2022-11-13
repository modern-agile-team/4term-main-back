import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateMannerTemperatureDto } from './dto/update-manner-temperature.dto';
import {
  MannerTemperatureDetail,
  MannerTemperatureReadResponse,
} from './interface/manner-Temperatures.interface';
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
  async createMannerTemperature(userProfile: number): Promise<number> {
    try {
      const { affectedRows, insertId } =
        await this.MannerRepository.createMannerTemperature(userProfile);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  // 매너온도 수정
  async updateMannerTemperature(
    userProfile: number,
    updateMannerTemperatureDto: UpdateMannerTemperatureDto,
  ): Promise<string> {
    try {
      const dataByDB = await this.getMannerTemperatureByNo(userProfile);
      const { mannerTemperature, count } = dataByDB;

      const updateMannerTemperature =
        await this.MannerRepository.updateMannerTemperature(
          userProfile,
          updateMannerTemperatureDto,
        );

      if (!updateMannerTemperature) {
        throw new NotFoundException(
          `${userProfile}번 게시글 수정 에러 updateMannerTemperature-service`,
        );
      }

      return `${2}번 게시글이 수정되었습니다.`;
    } catch (error) {
      throw error;
    }
  }
}
