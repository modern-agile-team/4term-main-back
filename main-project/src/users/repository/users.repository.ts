import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { AuthCredentialsDto } from 'src/auth/dto/auth-credential.dto';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Users } from '../entity/user.entity';
import { UsersDetail } from '../interface/user-profile.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
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
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async getUserByNo(userNo: number): Promise<object> {
    try {
      const user = this.createQueryBuilder('users')
        .where('users.no = :userNo', { userNo })
        .getOne();
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //이메일 중복체크
  async getUserByEmail(email: string): Promise<any> {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.no AS userNo', 'users.status AS status'])
        .where('users.email = :email', { email })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // test용으로 만든 임시 메서드 - board
  async getUserByNickname(nickname: string) {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.no AS no', 'users.nickname AS nickname'])
        .where('nickname = :nickname', { nickname })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }
  //닉네임 중복체크
  async checkEmail(email: string): Promise<UsersDetail> {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.email AS email'])
        .where('users.email = :email', { email })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //로그인
  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<string> {
    try {
      const { email } = authCredentialsDto;

      const user = await this.createQueryBuilder('users')
        .select(['users.email AS email'])
        .where('users.email = :email', { email })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateStatus(userNo: number, status: number): Promise<any> {
    try {
      const affected: UpdateResult = await this.createQueryBuilder()
        .update(Users)
        .set({ status })
        .where('no = :userNo', { userNo })
        .execute();
      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteUser(userNo: number) {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Users)
        .where('users.no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async getUserPayload(userNo: number) {
    try {
      const user = await this.createQueryBuilder()
        .leftJoin('users.usersProfileNo', 'users')
        .select([
          'users.userNo AS userNo',
          'users.isAdmin AS isAdmin',
          'users.email AS email',
          'usersProfile.nickname AS nickname',
        ])
        .where('users.no = :userNo', { userNo })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
