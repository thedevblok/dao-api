import { EtherscanService } from './services/etherscan.service';
import { EtherscanController } from './controllers/etherscan.controller';
import { EtherscanMiddleware } from './middlewares/etherscan.middleware';
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  CacheModule,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import etherscanConfig from './configs/etherscan.config';
import { NftCommands } from './command/nft.command';

@Module({
  imports: [
    ConfigModule.forFeature(etherscanConfig),
    HttpModule,
    CacheModule.register(),
  ],
  controllers: [EtherscanController],
  providers: [EtherscanService, NftCommands],
})
export class EtherscanModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(EtherscanMiddleware).forRoutes('api/*');
  }
}
