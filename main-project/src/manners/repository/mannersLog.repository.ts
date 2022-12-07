import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository, UpdateResult } from 'typeorm';
import { MannerDto } from '../dto/createManners.dto';
import { MannerLog } from '../entity/manners-log.entity';

@EntityRepository(MannerLog)
export class MannersLogRepository extends Repository<MannerLog> {
  // async giveScore(mannerInfo: MannerDto) {
  //   try {
  //     const { raw } = await this.createQueryBuilder('mannerLog')
  //       .insert()
  //       .into(MannerLog)
  //       .values(mannerInfo)
  //       .execute();

  //     return raw;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  async giveScore(mannerInfo: MannerDto): Promise<number> {
    try {
      const { chatUserNo, chatListNo, chatTargetUserNo, grade } = mannerInfo;

      const { affected }: UpdateResult = await this.createQueryBuilder(
        'mannerLog',
      )
        .update(MannerLog)
        .set(mannerInfo)
        .where('chatUserNo = :chatUserNo', { chatUserNo })
        .andWhere('chatListNo = :chatListNo', { chatListNo })
        .andWhere('chatTargetUserNo = :chatTargetUserNo', { chatTargetUserNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} giveScore-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
