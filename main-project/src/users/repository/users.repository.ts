import { InternalServerErrorException } from '@nestjs/common';
import { UsersDetail } from 'src/auth/interface/auth.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { SignUpDto } from '../dto/sign-up.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { Users } from '../entity/user.entity';
import { UserProfileDetail } from '../interface/user-profile.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  //회원가입 관련
  async createUser(signUpDto: SignUpDto): Promise<UsersDetail> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('users')
        .insert()
        .into(Users)
        .values(signUpDto)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  //회원가입 후 추가정보입력
  // async createProfile(
  //   userProfileDto: UserProfileDto,
  // ): Promise<UserProfileDetail> {
  //   try {
  //     const { raw }: InsertResult = await this.createQueryBuilder('users')
  //       .insert()
  //       .into(Users)
  //       .values(userProfileDto)
  //       .execute();

  //     return raw;
  //   } catch (error) {
  //     throw new InternalServerErrorException(
  //       `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
  //     );
  //   }
  //   }

  //회원정보 불러오기 관련
  async readUser(no: number): Promise<UserProfileDetail> {
    try {
      const userProfile = this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'userProfileNo')
        .select([
          // 'users.no AS no',
          // 'users.email AS email',
          'users.gender AS gender',
          'users.nickname AS nickname',
          // 'users.admin AS admin',
          // 'users.created_date AS createdDate',
          // 'users.deleted_date AS deletedDate',
          // 'userProfileNo.user_no AS userNo',
          'userProfileNo.description AS description',
          'userProfileNo.university_no AS universityNo',
          'userProfileNo.major_no AS majorNo',
        ])
        .where('users.no=:no', { no })
        .getRawOne();
      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} readUser-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
