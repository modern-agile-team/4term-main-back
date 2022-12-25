import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  async kakaoLogin(token: string) {
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded=utf-8',
      Authorization: 'Bearer ' + token,
    };

    const { data } = await axios({
      method: 'GET',
      url: kakaoUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = data.kakao_account;
  }

  async googleLogin(token: string) {
    const googleUserInfoUrl =
      'https://openidconnect.googleapis.com/v1/userinfo';
    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const googleUser = await axios({
      method: 'GET',
      url: googleUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = googleUser.data;
  }

  async naverLogin(token: string) {
    const naverUserInfoUrl = 'https://openapi.naver.com/v1/nid/me';
    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const { data } = await axios({
      method: 'GET',
      url: naverUserInfoUrl,
      timeout: 30000,
      headers,
    });

    const { email } = data.response;
  }
}
