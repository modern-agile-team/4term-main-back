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
import { Certificate, DetailedCertificate } from '../interface/user.interface';

@EntityRepository(UserCertificates)
export class UserCertificatesRepository extends Repository<UserCertificates> {
  async createCertificate(certificate: Certificate): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(UserCertificates)
        .values(certificate)
        .execute();

      return raw;
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

  async deleteCerticificateByNo(no: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(UserCertificates)
        .where('no = :no', { no })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 학적 정보 삭제 에러(deleteCerticificate): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getDetailedCertificateByNo(
    certificateNo: number,
  ): Promise<DetailedCertificate> {
    try {
      const certificate: DetailedCertificate = await this.createQueryBuilder(
        'user_certificates',
      )
        .leftJoin('user_certificates.userNo', 'users')
        .select([
          'users.no AS userNo',
          'users.status AS status',
          'user_certificates.certificate AS certificate',
          'user_certificates.major AS major',
        ])
        .where('no = :certificateNo', { certificateNo })
        .getRawOne();

      return certificate;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}사용자 학적 정보 상세 조회(getDetailedCertificateByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
