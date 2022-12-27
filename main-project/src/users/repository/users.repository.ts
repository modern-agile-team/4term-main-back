import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
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
}
