import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteReport() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 신고 삭제',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '게시글 신고 삭제 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
        {
          name: 'boardReportNotFound',
          example: { msg: `존재하지 않는 게시글 신고 번호입니다.` },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(deleteReport-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
