import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { HostMembers } from '../entity/host-members.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { UserNo } from '../interface/member.interface';

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

  async getHostsByMeetingNo(meetingNo: number): Promise<UserNo[]> {
    const hostMembers: UserNo[] = await this.createQueryBuilder('host_members')
      .where('host_members.meetingNo = :meetingNo', { meetingNo })
      .getMany();

    return hostMembers;
  }
}
