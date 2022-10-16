import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { MannersTemperature } from '../entity/manner-Temperatures.entity';
import { MannerTemperatureReadResponse } from '../interface/manner-Temperatures.interface';

@EntityRepository(MannersTemperature)
export class MannerTemperatureRepository extends Repository<MannersTemperature> {
  // 매너온도 조회 관련
  async getMannerTemperatureByNo(
    userProfileNo: number,
  ): Promise<MannerTemperatureReadResponse> {
    try {
      const manner = this.createQueryBuilder('manners')
        .leftJoin('manners.userProfile', 'mannerScore')
        .select([
          'manners.no AS no',
          'manners.mannerTemperature AS manner_temperature',
          'manners.count AS count',
        ])
        .where('manners.no = :userProfileNo', { userProfileNo })
        .getRawOne();

      return manner;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getMannerTemperatureByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 매너온도 생성
  async createMannerTemperature(userProfile: number) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'mannersTemperature',
      )
        .insert()
        .into(MannersTemperature)
        .values([{ userProfile }])
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createMannerTemperature-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
