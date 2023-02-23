import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function APiUploadFile() {
  return applyDecorators(
    ApiOperation({
      summary: '파일 전송 API',
      description:
        'files에 담긴 최대 10개의 파일을 전달받아 s3업로드 후 url배열 반환',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '파일 전송시 해당 파일의 url반환',
        '파일 업로드 성공',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'emptyUploadedFile',
          example: { msg: '업로드 할 파일이 존재하지 않습니다.' },
        },
      ]),
    ),
  );
}
