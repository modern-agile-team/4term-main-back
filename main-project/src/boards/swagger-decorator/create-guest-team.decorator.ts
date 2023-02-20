import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateGuestTeam() {
  return applyDecorators(
    ApiOperation({
      summary: '여름 참가 신청',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '참가신청 성공.'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'bookmarkAlreadyMaked',
          example: {
            msg: `북마크 생성(createBookmark-service): 이미 생성된 북마크입니다.`,
          },
        },
        {
          name: 'recruitMemberMismatch',
          example: {
            msg: `참가 신청(createGuestTeam-service): 신청 인원과 모집인원이 맞지 않습니다.`,
          },
        },
        {
          name: 'wrongUserJoin',
          example: {
            msg: `참가자 확인(validateGuests-service): 192번 참가자의 잘못된 신청.`,
          },
        },
        {
          name: 'AllGuestMembersMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 존재하지 않는 사용자들 입니다`,
          },
        },
        {
          name: 'GuestMemberMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 128번 사용자가 존재하지 않습니다.`,
          },
        },
        {
          name: 'wrongFriendList',
          example: {
            msg: `친구 확인(validateFriends-service): 작성자가 친구목록에 담겨있습니다.`,
          },
        },
        {
          name: 'friendsNone',
          example: {
            msg: `친구 확인(validateFriends-service): 사용자는 친구가 없습니다...`,
          },
        },
        {
          name: 'isNotFriend',
          example: {
            msg: `친구확인(validateFriends-service): 18번 사용자랑 친구가 아닙니다.`,
          },
        },
      ]),
    ),
  );
}
