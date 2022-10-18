import { InternalServerErrorException } from '@nestjs/common';
import { UserProfileDetail } from 'src/auth/interface/auth.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { SignUpDto } from '../dto/sign-up.dto';
import { Users } from '../entity/user.entity';
import {
  UserCreateResponse,
  UsersDetail,
} from '../interface/user-profile.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  //회원가입 관련
  async createUser(signUpDto: SignUpDto): Promise<UserCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('users')
        .insert()
        .into(Users)
        .values(signUpDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  //닉네임 중복체크
  async checkNickname(nickname: string): Promise<UsersDetail> {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.nickname AS nickname'])
        .where('users.nickname = :nickname', { nickname })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}  알 수 없는 서버 에러입니다.`,
      );
    }
  }
  //이메일 중복체크
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

  //유저 정보 불러오기
  async readUser(nickname: string): Promise<UserProfileDetail> {
    try {
      const user = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'profile')
        .select([
          'users.nickname AS nickname',
          'users.gender AS gender',
          'profile.description AS description',
          // 'userProfile.profileImage AS profileImage',
          // 'userProfile.profileImage AS mannerNo',
        ])
        .where('users.nickname = :nickname', { nickname })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} readUserInfo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
