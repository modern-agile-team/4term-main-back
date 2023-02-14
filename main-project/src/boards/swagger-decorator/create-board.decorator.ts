import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateBoard() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 생성',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '게시글 생성 성공.'),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'AllHostMembersMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 존재하지 않는 사용자들 입니다`,
          },
        },
        {
          name: 'HostMembersMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 128번 사용자가 존재하지 않습니다.`,
          },
        },
      ]),
    ),
  );
}
