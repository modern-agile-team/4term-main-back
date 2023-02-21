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
        report: {
          no: 22,
          userNo: 14,
          title: '집가고싶다sss',
          description: '집가서 마파두부 먹고싶',
          createdDate: '2023.02.20 14:06:26',
          targetBoardNo: null,
          targetUserNo: 16,
          imageUrls: [null],
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'reportyNotFound',
          example: {
            msg: `신고내역 상세 조회(getReport): 3번 신고내역이 없습니다.`,
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
