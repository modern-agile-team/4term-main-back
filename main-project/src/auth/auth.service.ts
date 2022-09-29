import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileDto } from 'src/users/dto/user-profile.dto';
import { UserProfileDetail } from 'src/users/interface/user-profile.interface';
import { SignUpDto } from '../users/dto/sign-up.dto';
import { UsersRepository } from '../users/repository/users.repository';
import { UsersDetail } from './interface/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
  ) {}

  async singUp(signUpDto: SignUpDto): Promise<UsersDetail> {
    return this.usersRepository.createUser(signUpDto);
  }

  // async createProfile(
  //   userProfileDto: UserProfileDto,
  // ): Promise<UserProfileDetail> {
  //   return this.usersRepository.createProfile(userProfileDto);
  // }
}
