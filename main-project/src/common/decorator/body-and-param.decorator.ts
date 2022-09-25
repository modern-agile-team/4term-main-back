import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BodyAndParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    Object.keys(req.params).forEach((key) => {
      req.params[key] = parseInt(req.params[key]);
    });

    return { ...req.body, ...req.params };
  },
);
