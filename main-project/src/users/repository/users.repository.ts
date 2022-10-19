import { InternalServerErrorException } from '@nestjs/common';
import { UserProfileDetail } from 'src/auth/interface/auth.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfile } from '../entity/user-profile.entity';
import { Users } from '../entity/user.entity';
import {
  UpdateUserInfo,
  UpdateUsersDetail,
  UserCreateResponse,
  UsersDetail,
} from '../interface/user-profile.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  //회원가입 관련
  async signUp(signUpDto: SignUpDto): Promise<UserCreateResponse> {
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
  async readUserByNo(userNo: number): Promise<UserProfileDetail> {
    try {
      const user = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'profile')
        .select([
          'users.nickname AS nickname',
          'users.gender AS gender',
          // 'users.description AS description',
          // 'userProfile.profileImage AS profileImage',
          // 'AS mannerNo',
          //학교추가, 학과추가, 매너온도 추가
        ])
        .where('users.no = :userNo', { userNo })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} readUserInfo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  //유저 정보 수정
  async updateUser(userNo: number, nickname: UpdateUserDto): Promise<number> {
    try {
      const { raw }: UpdateResult = await this.createQueryBuilder('Users')
        .update(Users)
        .set(nickname)
        .where('no = :userNo', { userNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //   //유저 정보 수정
  //   async updateUserInfo(userNo: number, description: string): Promise<number> {
  //     try {
  //       const updateColumn = { description };

  //       const { affected }: UpdateResult = await this.createQueryBuilder()
  //         .update(UserProfile)
  //         .set(updateColumn)
  //         .where('userNo = :userNo', { userNo })
  //         .execute();

  //       return affected;
  //     } catch (error) {
  //       throw new InternalServerErrorException(
  //         `${error} 알 수 없는 서버 에러입니다.`,
  //       );
  //     }
  //   }
}
