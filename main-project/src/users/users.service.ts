import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { CreateUserDto } from './dto/create-user.dto';
import { UserProfileRepository } from './repository/users-profile.repository';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private userProfileRepository: UserProfileRepository,
  ) {}

  private async getUserByNo(userNo: number): Promise<any> {
    try {
      const user = await this.usersRepository.getUserByNo(userNo);
      if (!user) {
        throw new NotFoundException(
          `${userNo} 님 정보 불러오기를 실패 했습니다.`,
        );
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
  public async createUserProfile(userNo: number, createUserDto: CreateUserDto) {
    try {
      const { status } = await this.getUserByNo(userNo);
      if (status != 0) {
        throw new BadRequestException(
          `status가 0인 유저에 대해서만 프로필을 생성할 수 있습니다.`,
        );
      }
      await this.userProfileRepository.createUserProfile(userNo, createUserDto);
      // console.log(user);                                                                    ``
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userNo: number, description: string) {
    try {
      const { status } = await this.getUserByNo(userNo);
      if (status === 0) {
        throw new BadRequestException(
          `아직 프로필이 생성되지 않은 유저입니다.`,
        );
      }
      await this.userProfileRepository.updateUserProfile(description, userNo);
    } catch (error) {
      throw error;
    }
  }
}
//   //Refresh Token
//   async signInByOAuth({ accessToken, oAuthAgency }: CreateUserByOAuthDto) {
//     const id = await this.authService.validateOAuth(accessToken, oAuthAgency);

//   const userStatus = await this.usersRepository.find({
//     where:{
//       accont: id,
//     },
//     select: {status: true}
//   });

// }
