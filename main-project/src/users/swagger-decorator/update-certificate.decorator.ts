import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateCertificate() {
  return applyDecorators(
    ApiOperation({
      summary: '학적 인증 반려된 유저의 학적 파일 재등록',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '프로필 이미지 파일',
          },
          major: {
            maxLength: 45,
            type: 'string',
            example: '컴퓨터소프트웨어학과',
            description: '학과 정보',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo,status 반환',
        '학적 정보가 재등록되었습니다.',
        {
          user: {
            userNo: 1,
            status: UserStatus.NOT_CONFIRMED,
          },
        },
      ),
    ),
  );
}
