import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { initializeDataSource } from './database/data-source';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await initializeDataSource(this.configService);
  }
}
