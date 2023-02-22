import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateReport() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '신고내역 수정',
      description: '신고내역의 제목, 내용, 사진을 수정',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '경찰아저씨 저 사람 좀 잡아가세요',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '신고내역 제목',
          },
          description: {
            type: 'string',
            example: '제 마음을 훔쳐갔어요....!',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '신고내역 내용',
          },
          files: {
            type: 'string',
            format: 'binary',
            example: 'test.jpg',
            description: '신고 이미지 파일(send empty value 체크해제 필수)',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '신고내역 수정 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'reportNotFound',
          example: {
            msg: `신고내역 상세 조회(getReport-service): 4번 신고내역이 없습니다.`,
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
