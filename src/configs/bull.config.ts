import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModuleOptions, SharedBullAsyncConfiguration } from '@nestjs/bull';

export const bullConfig: SharedBullAsyncConfiguration = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<BullModuleOptions> => ({
    redis: {
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: configService.getOrThrow<number>('REDIS_PORT'),
      ...(configService.get<string>('REDIS_PASSWORD')
        ? { password: configService.get<string>('REDIS_PASSWORD') }
        : {}),
    },
  }),
  inject: [ConfigService],
};
