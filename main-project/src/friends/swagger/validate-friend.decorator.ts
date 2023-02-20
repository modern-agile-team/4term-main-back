import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiValidateFriend() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 검증',
      description: ' 파라미터로 전달한 상대 유저 번호로 친구여부 확인',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('친구 여부 반환', undefined, {
        isFriend: true,
      }),
    ),
  );
}
