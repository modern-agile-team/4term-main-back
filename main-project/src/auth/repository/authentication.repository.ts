import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
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

  async findAuthByUserNo(userNo: number): Promise<Authentication> {
    try {
      const auth: Authentication = await this.createQueryBuilder(
        'authentication',
      )
        .leftJoin('authentication.userNo', 'users')
        .select([
          'users.no AS userNo',
          'authentication.password AS password',
          'authentication.failedCount AS failedCount',
        ])
        .where(`user_no = :userNo`, { userNo })
        .getRawOne();

      return auth;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 인증 정보 조회(findAuthByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateFailedCount(
    userNo: number,
    failedCount: number,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update()
        .set({ failedCount })
        .where('user_no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 로그인 실패 횟수 업데이트(updateFailedCount): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
