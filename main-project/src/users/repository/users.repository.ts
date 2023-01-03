import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Users } from '../entity/user.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  async getUserByEmail(email: string): Promise<any> {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.no AS userNo', 'users.status AS status'])
        .where('users.email = :email', { email })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 이메일 조회 에러(getUserByEmail): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUser(email: string): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('users')
        .insert()
        .into(Users)
        .values({ email })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 생성(createUser): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserByNo(userNo: number): Promise<Users> {
    try {
      const user = await this.createQueryBuilder('users')
        .where('users.no = :userNo', { userNo })
        .getOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 조회 에러(getUserByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateUserStatus(userNo: number, status: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Users)
        .set({ status })
        .where('no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 상태 수정 에러(updateUserStatus): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
