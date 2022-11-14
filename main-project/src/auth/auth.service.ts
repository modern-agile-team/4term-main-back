import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/users/interface/user-profile.interface';
import { UserProfileRepository } from 'src/users/repository/users-profile.repository';
import { UsersRepository } from '../users/repository/users.repository';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService, // private readonly usersService: UsersService, // private readonly configService: ConfigService, // private readonly httpService: HttpService,
  ) {}
  private async updateStatus(userNo: number, status: UserStatus) {
    try {
      let user = await this.usersRepository.updateStatus(userNo, status);
      if (user) {
        user = { status: 2 };
      }
    } catch (error) {
      throw error;
    }
  }

  private async createUser(email: string) {
    try {
      const { insertId, affectedRows } = await this.usersRepository.createUser(
        email,
      );

      if (affectedRows == 1) {
        throw new InternalServerErrorException('');
      }
      return insertId;
    } catch (err) {
      throw err;
    }
  }

  async signIn(email: string): Promise<any> {
    try {
      let user = await this.usersRepository.getUserByEmail(email); //userNo, status 받아올거

      //(처음 로그인 할 때)
      if (!user) {
        const userNo = await this.createUser(email);
        // await this.userProfileRepository.createUserProfile();
        user = { userNo, status: 0 };
      }
      //(회원가입이 되었고, 학적이 확인이 된 유저 일 때 토큰을 줌)
      if (user.status == 2) {
        const payload = { userNo: user.no };
        user.accessToken = await this.jwtService.sign(payload);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // try {
  //   const { affectedRows, insertId } = await this.usersRepository.signUp(
  //     email,
  //   );
  //   if (!(affectedRows && insertId)) {
  //     throw new InternalServerErrorException(`유저 생성 오류입니다.`);
  //   }
  //   return insertId;
  //   // return await this.usersRepository.test();
  // } catch (error) {
  //   throw error;
  // }

  //유저 닉네임 중복체크
  async checkNickname(authDto: AuthDto): Promise<object> {
    try {
      const user = await this.usersRepository.checkNickname(authDto.nickname);

      if (user) {
        throw new ConflictException(`이미 사용중인 닉네임입니다.`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
