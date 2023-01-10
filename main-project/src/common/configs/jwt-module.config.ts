import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    signOptions: {
      expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
    },
    secret: configService.get<string>('JWT_SECRET_KEY'),
  }),
  inject: [ConfigService],
});
