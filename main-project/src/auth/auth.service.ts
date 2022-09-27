import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  async singUp(signUpDto: SignUpDto): Promise<object> {
    const { email, password, name }: SignUpDto = signUpDto;
  }
}
