import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { SignInDto } from 'src/auth/dto/auth.dto';
import { UserPayload } from 'src/auth/interface/auth.interface';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Users } from '../entity/user.entity';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
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
        `${error} getUserByNickname-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUser(user: SignInDto): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('users')
        .insert()
        .into(Users)
        .values(user)
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

  async getUserPayload(userNo: number): Promise<UserPayload> {
    try {
      const user = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'userProfiles')
        .leftJoin('userProfiles.profileImage', 'profileImages')
        .select([
          'users.no AS userNo',
          'users.isAdmin AS isAdmin',
          'users.gender AS gender',
          'users.email AS email',
          'userProfiles.nickname AS nickname',
          'profileImages.imageUrl AS profileImage',
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
