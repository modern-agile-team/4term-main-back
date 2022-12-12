import { CacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const cacheModule = CacheModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    store: redisStore,
    host: configService.get<string>('REDIS_HOST'),
    port: configService.get<number>('REDIS_PORT'),
    ttl: 0,
    auth_pass: configService.get<string>('REDIS_PASSWORD'),
  }),
});
