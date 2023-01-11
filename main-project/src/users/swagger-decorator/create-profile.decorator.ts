import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 프로필 생성',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          nickname: {
            type: 'string',
            example: '여름',
            minLength: 2,
            maxLength: 12,
            description: '유저 닉네임',
          },
          gender: {
            type: 'boolean',
            example: true,
            nullable: false,
            description: '성별 (여자 : 0, 남자 : 1)',
          },
          description: {
            type: 'string',
            description: '간단한 소개글(선택)',
            maxLength: 45,
          },
          major: {
            maxLength: 45,
            description: '재학 중인 학과',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: '프로필 이미지 파일',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo 및 status 반환',
        '프로필이 등록되었습니다.',
        { user: { userNo: 1, status: UserStatus.NO_CERTIFICATE } },
      ),
    ),
  );
}
