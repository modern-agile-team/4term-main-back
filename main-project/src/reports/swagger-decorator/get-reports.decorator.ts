import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetReports() {
  return applyDecorators(
    ApiOperation({
      summary: '신고내역 전체/필터 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '신고내역 전체/필터 조회',
        '신고내역 전체/필터 조회 성공',
        {
          reports: [
            {
              no: 4,
              userNo: 16,
              title: 'test',
              description: 'test description',
              isDone: 0,
              createdDate: '2023.01.30 16:34:05',
            },
            {
              no: 4,
              userNo: 16,
              title: 'test',
              description: 'test description',
              isDone: 0,
              createdDate: '2023.01.30 16:34:05',
            },
          ],
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'reportsNotFound',
          example: {
            msg: `신고내역 전체 조회(getReports-service): 신고내역이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
