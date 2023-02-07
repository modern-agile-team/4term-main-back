import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetReport() {
  return applyDecorators(
    ApiOperation({
      summary: '신고내역 상세 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('신고내역 조회', '신고내역 조회 성공', {
        enquiries: {
          no: 4,
          userNo: 16,
          title: 'test',
          description: 'test description',
          isDone: 0,
          createdDate: '2023.01.30 16:34:05',
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'reportyNotFound',
          example: {
            msg: `문의 상세 조회(readReport-service): 3번 신고내역이 없습니다.`,
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(getEnquiry-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
