import { join } from 'path';

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import 'sqlite3';

export const createDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'sqlite',
    database: join(__dirname, '..', 'data', 'camStream.sqlite'),
    logging: configService.get<boolean>('TYPEORM_LOGGING', false),
    synchronize: false,
    entities: [join(__dirname, '/../modules/**/entities/*.entity.{ts,js}')],
    migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
    migrationsTableName: 'migrations',
  });
};

export const initializeDataSource = async (configService: ConfigService) => {
  const dataSource = createDataSource(configService);
  await dataSource.initialize();
};
