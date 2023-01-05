import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ReturnInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now(); //현재 시간을 얻기 위해 사용됨
    console.log(`Before... ${Date.now() - now}ms`);

    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`)), // 로깅 처리
      map(({ msg, response }) => {
        return {
          success: true,
          msg,
          response,
        };
      }), // 클라이언트에게 반환 되는 정보(각 컨트롤러 결과 값)
    );
  }
}
