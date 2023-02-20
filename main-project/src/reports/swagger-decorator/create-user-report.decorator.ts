import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateReportUser() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 신고 생성',
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '제가 고백했는데 읽씹했어요ㅠㅠㅠㅠ',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '유저 신고 제목',
          },
          description: {
            type: 'string',
            example: '자다가 침대에서 굴러 떨어지게해주세요...',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '유저 신고 내용',
          },
          targetUserNo: {
            type: 'number',
            example: 54,
            nullable: false,
            description: '신고할 유저 번호',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '유저 신고 생성 성공.',
      ),
    ),
  );
}
