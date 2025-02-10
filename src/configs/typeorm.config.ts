import { join } from 'path';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const TypeOrmConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'sqlite',
    database: join(__dirname, '..', 'data', 'camStream.sqlite'),
    logging: configService.get<boolean>('TYPEORM_LOGGING', false),
    synchronize: false,
    autoLoadEntities: true,
    migrationsRun: configService.get<string>('NODE_ENV') === 'production',
    entities: [join(__dirname, '/../modules/**/entities/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
    migrationsTableName: 'migrations',
  }),
};
