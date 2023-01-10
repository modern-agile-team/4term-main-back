import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const mailModule = MailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>('EMAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: configService.get<string>('EMAIL_AUTH_EMAIL'),
        pass: configService.get<string>('EMAIL_AUTH_PASSWORD'),
      },
    },
  }),
});
