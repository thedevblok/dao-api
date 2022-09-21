import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from './config/typeorm.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule.forFeature(typeormConfig)],
      useFactory: (config: ConfigService): TypeOrmModule => ({
        ...config.get('typeorm'),
        type: 'mysql',
        synchronize: true,
        migrationsTableName: 'migrations',
        migrations: ['src/migration/*.ts'],
        cli: {
          migrationsDir: 'src/migration',
        },
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
  ],
})
export class CoreModule {}
