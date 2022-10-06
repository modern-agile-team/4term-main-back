import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { HostMembers } from '../entity/host-members.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { DeleteMember } from '../interface/member.interface';

@EntityRepository(HostMembers)
export class HostMembersRepository extends Repository<HostMembers> {
  async saveHostMembers(hostsInfo: object[]): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'host_members',
      )
        .insert()
        .into(HostMembers)
        .values(hostsInfo)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} saveHostMembers: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteHost({ meetingNo, userNo }: DeleteMember): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(HostMembers)
        .where('meetingNo = :meetingNo', { meetingNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} deleteHost: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
