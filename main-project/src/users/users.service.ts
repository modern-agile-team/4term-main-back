import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { access } from 'fs';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserByOAuthDto } from 'src/auth/dto/createUserByOAuthDto';
import {
  OAuthAgency,
  UserProfileDetail,
} from 'src/auth/interface/auth.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './repository/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository, // private authService: AuthService,
  ) {}

  //유저 불러오기
  async readUserByNo(userNo: number): Promise<UserProfileDetail> {
    try {
      const user = await this.usersRepository.readUserByNo(userNo);

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

  //유저 정보 수정하기
  // async updateUser(userNo: number, nickname: UpdateUserDto): Promise<void> {
  //   try {
  //     await this.readUserByNo(userNo);
  //     await this.usersRepository.updateUser(userNo, nickname);

  //     return;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  //유저 삭제하기
  async signDown(userNo: number) {
    try {
      const affected = await this.usersRepository.signDown(userNo);

      if (!affected) {
        throw new InternalServerErrorException();
      }
      return;
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
