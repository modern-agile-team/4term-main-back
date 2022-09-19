import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyAndParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return { body: req.body, params: req.params };
  },
);
