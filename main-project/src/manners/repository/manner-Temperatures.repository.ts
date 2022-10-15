import { InternalServerErrorException } from '@nestjs/common';
import { Boards } from 'src/boards/entity/board.entity';
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
          'manners.mannerScore AS manner_score',
          'manners.count AS count',
        ])
        .where('manners.no = :userProfileNo', { userProfileNo })
        .getRawOne();

      return manner;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} readManner-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // 매너온도 생성 test
  async createMannerTemperature(userProfileNo: number) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('manners')
        .insert()
        .into(MannersTemperature)
        .values([{ userProfile: userProfileNo }])
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createManner-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
