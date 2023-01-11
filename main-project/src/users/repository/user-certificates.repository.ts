import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
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

  async getCertifiacateByNo(userNo: number): Promise<UserCertificates> {
    try {
      const certificate: UserCertificates = await this.createQueryBuilder()
        .where('user_no = :userNo', { userNo })
        .getOne();

      return certificate;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 학적 조회 에러(getUserCertificateByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteCerticificate(userNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(UserCertificates)
        .where('userNo = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 학적 정보 삭제 에러(deleteCerticificate): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateCertificate(
    userNo: number,
    certificate: string,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update()
        .set({ certificate })
        .where('user_no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}사용자 학적 증명 수정(updateCertificate): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
