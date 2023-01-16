import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyAndUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const { user, body } = ctx.switchToHttp().getRequest();

    return { userNo: user, ...body };
  },
);
