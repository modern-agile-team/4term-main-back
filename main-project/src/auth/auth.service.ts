import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { raw } from 'express';
import { UsersRepository } from '../users/repository/users.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService, // private readonly usersService: UsersService, // private readonly configService: ConfigService, // private readonly httpService: HttpService,
  ) {}

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

  async signIn(email: string): Promise<object> {
    try {
      let user = await this.usersRepository.getUserByEmail(email); //userNo, status 받아올거

      //(처음 로그인 할 때)
      if (!user) {
        const userNo = await this.createUser(email);
        user = { userNo, status: 0 };
      }
      //(회원가입이 되었고, 학적이 확인이 된 유저 일 때 토큰을 줌)
      if (user.status == 2) {
        const payload = { userNo: user.no, userStatus: user.status };
        user.accessToken = await this.jwtService.sign(payload);
      }

      //이미 회원가입이 되어 있지만 학적이 인증되지 않은 유저?
      if (user.status == 1) {
        await this.createUser(email);
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
}
//로그인
//유저 닉네임 중복체크
// async checkNickname(authDto: AuthDto): Promise<object> {
//   try {
//     const user = await this.usersRepository.checkNickname(authDto.nickname);

//     if (user) {
//       throw new ConflictException(`이미 사용중인 닉네임입니다.`);
//     }
//     return user;
//   } catch (error) {
//     throw error;
//   }
// }
//로그인

// async validateOAuth(
//   createUserByOAuthDto: CreateUserByOAuthDto,
// ): Promise<any> {
//   try {
//     const { accessToken, oAuthAgency } = createUserByOAuthDto;
//     const ajaxConfig = {
//       headers: { Authorization: 'Bearer' + ' ' + accessToken },
//     };
//     const response: any = await lastValueFrom(
//       this.httpService.get('', ajaxConfig).pipe(map((res) => res.data)),
//     );
//     // return +response.id;
//   } catch (error) {
//     throw new UnauthorizedException('소셜 로그인 실패');
//   }
// }
//회원생성
// async signUp(email: string): Promise<void> {
//   try {
//     const user = await this.usersRepository.checkUserExist(email);
//     if (user) {
//       // 로그인
//     }
//     const affectedRows = await this.usersRepository.createUser(email);
//     if (!affectedRows) {
//       throw new InternalServerErrorException('서버 문제입니다');
//     }
//   } catch (error) {
//     throw error;
//   }
// }

// async signDown(userNo: number): Promise<any> {
//   try {
//     const { affectedRows, insertId } = await this.usersRepository.signDown(
//       userNo,
//     );

//     if (!(affectedRows && insertId)) {
//       throw new InternalServerErrorException(`유저 삭제 오류입니다.`);
//     }
//     return insertId;
//   } catch (error) {
//     throw error;
//   }
