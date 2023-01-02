import { InternalServerErrorException } from '@nestjs/common';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { MannerLog } from '../entity/manners-log.entity';
import { Manner } from '../interface/manner.interface';

@EntityRepository(MannerLog)
export class MannersLogRepository extends Repository<MannerLog> {
  async giveScore(mannerInfo) {
    try {
      const { raw } = await this.createQueryBuilder('mannerLog')
        .insert()
        .into(MannerLog)
        .values(mannerInfo)
        .execute();
      return raw;
    } catch (error) {
      throw error;
    }
  }
  // async giveScore(mannerInfo: MannerDto): Promise<number> {
  //   try {
  //     const { chatUserNo, chatListNo, chatTargetUserNo, grade } = mannerInfo;
  //     const { affected }: UpdateResult = await this.createQueryBuilder(
  //       'mannerLog',
  //     )
  //       .update(MannerLog)
  //       .set(mannerInfo)
  //       .where('chatUserNo = :chatUserNo', { chatUserNo })
  //       .andWhere('chatListNo = :chatListNo', { chatListNo })
  //       .andWhere('chatTargetUserNo = :chatTargetUserNo', { chatTargetUserNo })
  //       .execute();
  //     return affected;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `${error} giveScore-repository: 알 수 없는 서버 에러입니다.`,
  //     );
  //   }
  // }
  async createMannerLog(mannerLog: Manner): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('mannerLog')
        .insert()
        .into(MannerLog)
        .values(mannerLog)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}createMannerLog: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async updateMannerLog(mannerLog: Manner): Promise<number> {
    try {
      const { chatRoomNo } = mannerLog;
      const { affected }: UpdateResult = await this.createQueryBuilder(
        'mannerLog',
      )
        .update(mannerLog)
        .set(mannerLog)
        .where('manner_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .execute();
      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}createMannerLog: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
