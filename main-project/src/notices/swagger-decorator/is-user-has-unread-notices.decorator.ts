import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiIsUserHasUnreadNotices() {
  return applyDecorators(
    ApiOperation({
      summary: '안 읽은 알림 있는지 확인',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '안 읽은 알림 있는지 조회',
        '유저 읽지 않은 알림 조회',
        { isUserHasUnreadNotices: true },
      ),
    ),
  );
}
