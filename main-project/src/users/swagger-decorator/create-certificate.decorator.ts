import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateCertificate() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 학적 파일 업로드',
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
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo,status 반환',
        '유저 학적 파일이 업로드되었습니다.',
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
