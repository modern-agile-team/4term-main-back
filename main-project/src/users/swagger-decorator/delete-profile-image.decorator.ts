import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteProfileImage() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '유저 프로필 이미지 삭제',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'accessToken 반환',
        '프로필 이미지가 삭제되었습니다.',
        {
          accessToken: '갱신된 토큰',
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noProfileImage',
          example: { msg: '프로필 이미지가 존재하지 않는 유저입니다.' },
        },
      ]),
    ),
  );
}
