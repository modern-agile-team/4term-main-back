import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Manners } from '../entity/manners.entity';

@EntityRepository(Manners)
export class MannersRepository extends Repository<Manners> {
  async getGradeByUserNo(userNo): Promise<number[]> {
    try {
      const grade = await this.createQueryBuilder('manners')
        .select('manners.grade AS grade')
        .where('manners.chat_user_no = :userNo', { userNo })
        .getRawOne();

      return grade;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGradeByUserNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async userGradebyUserProfileNo(userProfileNo): Promise<number> {
    try {
      const grade = await this.createQueryBuilder('manners')
        .select('manners.grade AS grade')
        .where('manners.user_profile_no = :userProfileNo', { userProfileNo })
        .getRawOne();

      return grade;
    } catch (error) {
      throw error;
    }
  }
}
