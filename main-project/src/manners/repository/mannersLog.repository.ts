import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { MannerLog } from '../entity/manners-log.entity';

@EntityRepository(MannerLog)
export class MannersLogRepository extends Repository<MannerLog> {
  async getGradeByUserNo(userNo: number): Promise<number> {
    try {
      const { grade } = await this.createQueryBuilder('manner_log')
        .leftJoin('manner_log.mannerNo', 'grade')
        .select('grade.grade AS grade')
        .where('chat_user_no = :userNo', { userNo })
        .getRawOne();
      console.log(grade);
      return grade;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGradeByUserNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
