import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '유저 기본 프로필 수정',
      description: '닉네임, 소개글 중 최소 하나는 변경 사항이 있어야 함',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo 및 status 반환',
        '프로필이 수정되었습니다.',
        {
          user: {
            userNo: 1,
            status: UserStatus.CONFIRMED,
            accessToken: '갱신된 토큰(닉네임 변경 시에만 토큰 새로 발급)',
          },
        },
      ),
    ),
  );
}
