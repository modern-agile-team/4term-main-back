import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { Manners } from '../entity/manners.entity';
import { updatedManner } from '../interface/manner.interface';

@EntityRepository(Manners)
export class MannersRepository extends Repository<Manners> {
  async updateManner(
    userNo: number,
    updatedManner: updatedManner,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update()
        .set(updatedManner)
        .where('user_no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 매너 수정 오류(updateManner): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMannerByUserNo(userNo: number): Promise<Manners> {
    try {
      const manner: Manners = await this.createQueryBuilder('manners')
        .select([
          'no',
          'user_no AS userNo',
          'grade',
          'grade_count AS gradeCount',
        ])
        .where('manners.user_no = :userNo', { userNo })
        .getRawOne();

      return manner;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 매너 조회 에러(getMannerByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
