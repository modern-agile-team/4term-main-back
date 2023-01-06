import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { UserCertificates } from '../entity/user-certificate.entity';

@EntityRepository(UserCertificates)
export class UserCertificatesRepository extends Repository<UserCertificates> {
  async createCertificate(
    userNo: number,
    certificate: string,
  ): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(UserCertificates)
        .values({ userNo, certificate })
        .execute();
      const { affectedRows }: ResultSetHeader = raw;

      return affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}사용자 학적 증명 추가 오류(createCertificate): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
