import { join } from 'path';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TypeOrmConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.getOrThrow<string>('POSTGRES_HOST'),
    port: Number(configService.getOrThrow<number>('POSTGRES_PORT')),
    database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
    username: configService.getOrThrow<string>('POSTGRES_USER'),
    password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    logging: configService.get<boolean>('TYPEORM_LOGGING', false),
    schema: 'media',
    synchronize: false,
    autoLoadEntities: true,
    migrationsRun: configService.get<string>('NODE_ENV') === 'production',
    entities: [join(__dirname, '/../modules/**/entities/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
    migrationsTableName: 'migrations',
  }),
};
