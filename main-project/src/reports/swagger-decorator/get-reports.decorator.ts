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
          reportPagenation: {
            reports: [
              {
                no: 21,
                userNo: 15,
                title: '집가고싶다sss',
                description: '집가서 마파두부 먹고싶',
                createdDate: '2023.02.17 15:21:53',
              },
              {
                no: 20,
                userNo: 15,
                title: '집가고싶다sss',
                description: '집가서 마파두부 먹고싶',
                createdDate: '2023.02.17 15:21:51',
              },
              {
                no: 18,
                userNo: 15,
                title: 'ㅁㅇㅁㄴㅇ',
                description: 'adasdassda ',
                createdDate: '2023.02.08 17:52:01',
              },
            ],
            totalPage: 1,
            page: 1,
          },
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'reportsNotFound',
          example: {
            msg: '신고내역 상세 조회(getReports-service): 신고내역이 없습니다!',
          },
        },
      ]),
    ),
  );
}
