import { InternalServerErrorException } from '@nestjs/common';
import { DeleteResult, EntityRepository, Repository } from 'typeorm';
import { Manners } from '../entity/manners.entity';

@EntityRepository(Manners)
export class MannersRepository extends Repository<Manners> {
  async userGradebyUserProfileNo(userProfileNo): Promise<number> {
    try {
      const grade = await this.createQueryBuilder('manners')
        .select('manners.grade AS grade')
        .where('manners.user_profile_no = :userProfileNo', { userProfileNo })
        .getRawOne();

      return grade;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} userGradebyUserProfileNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async deleteManner(userProfileNo) {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'manners',
      )
        .delete()
        .from(Manners)
        .where('userProfileNo = :userProfileNo', { userProfileNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteManner-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // async updateManner(userNo:number){
  //   try {
  //     const affected = await this.createQueryBuilder('manners')
  //     .update()
  //     .set()
  //     .where()
  //     .execute()

  //     return
  //   } catch (error) {

  //   }
  // }
  async getGradeByUserNo(userNo: number) {
    try {
      const grade = await this.createQueryBuilder('manners')
        .select('manners.grade AS grade')
        .where(`manners.chat_user_no = :userNo`, { userNo })
        .getRawOne();

      return grade;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGrade-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
