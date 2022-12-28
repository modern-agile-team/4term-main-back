import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { Authentication } from '../entity/authentication.entity';
import { UserAuth } from '../interface/auth.interface';

@EntityRepository(Authentication)
export class AuthRepository extends Repository<Authentication> {
  async createAuth(userAuth: UserAuth): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'authentication',
      )
        .insert()
        .into(Authentication)
        .values(userAuth)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 비밀번호 생성(createPassword): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async findAuthByUserNo(userNo: number): Promise<UserAuth> {
    try {
      const auth: UserAuth = await this.createQueryBuilder('authentication')
        .where(`authentication.userNo = :userNo`, { userNo })
        .getOne();

      return auth;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 인증 정보 조회(findAuthByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
