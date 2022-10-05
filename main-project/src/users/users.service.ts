import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileDto } from './dto/user-profile.dto';
import { UserProfileDetail } from './interface/user-profile.interface';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  async readUserProfile(profileUserNo: number): Promise<UserProfileDetail> {
    try {
      // const { no, description, majorNo, universityNo, gender, nickname } =
      //   userProfileDto;
      const user: UserProfileDetail = await this.usersRepository.readUser(
        profileUserNo,
      );

      if (!user) {
        throw new NotFoundException(`${user} 회원을 찾을 수 없습니다.`);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
