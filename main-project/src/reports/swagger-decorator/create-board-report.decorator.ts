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

export function ApiCreateReportBoard() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 신고 생성',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '광고성 글이네요 광고회사 사이트인 줄ㅋㅋㅋㅋ',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '게시글 신고 제목',
          },
          description: {
            type: 'string',
            example: '@@@@@@@@@@@광고광고빔 빰빠마ㅃ마빠빠마빠빰',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '게시글 신고 내용',
          },
          boardNo: {
            type: 'number',
            example: 54,
            description: '신고할 게시글 번호',
          },
          files: {
            type: 'string',
            format: 'binary',
            nullable: true,
            description: '신고 이미지 파일',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '게시글 신고 생성 성공.',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: {
            msg: `게시글 신고 생성(validateBoard-service): 3번 게시글을 찾을 수 없습니다.`,
          },
        },
      ]),
    ),
  );
}
