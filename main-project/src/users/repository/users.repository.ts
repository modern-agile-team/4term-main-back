import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UserStatus } from '../../common/configs/user-status.config';
import { Users } from '../entity/user.entity';
import { User } from '../interface/user.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  async getUserByEmail(email: string): Promise<User> {
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
      const user: Users = await this.createQueryBuilder('users')
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

  async softDeleteUser(userNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .softDelete()
        .from(Users)
        .where('no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 회원 탈퇴 에러(softDeleteUser): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteHaltedUsers(): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(Users)
        .where(
          `status = ${UserStatus.NO_PROFILE} OR status = ${UserStatus.NO_CERTIFICATE} OR status = ${UserStatus.DENIED}`,
        )
        .andWhere('DATEDIFF(NOW(), updated_date) >= 10')
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 가입 중단한 유저 삭제(deleteHaltedUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getConfirmedUserByNo(userNo: number): Promise<Users> {
    try {
      const user: Users = await this.createQueryBuilder('users')
        .where('users.no = :userNo', { userNo })
        .andWhere('users.status = :status', { status: UserStatus.CONFIRMED })
        .getOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 가입 완료된 조회 에러(getConfirmedUserByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUsersByNums(userNo: number[]) {
    try {
      const users = await this.createQueryBuilder('users')
        .select(['JSON_ARRAYAGG(users.no) AS no'])
        .where('no IN (:userNo)', { userNo })
        .getRawOne();

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 조회 에러(getUsersByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
