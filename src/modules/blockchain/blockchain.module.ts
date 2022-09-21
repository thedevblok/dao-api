import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import blockchainConfig from './configs/blockchain.config';
import { BlockchainCommands } from './command/blockchain.command';
import { GetStatsController } from './controllers/stats.controller';
import { GetVotesController } from './controllers/vote.controller';
import { BlockchainService } from './services/blockchain.service';
import { StatsService } from './services/stats.service';
import { VoteService } from './services/vote.service';

@Module({
  imports: [ConfigModule.forFeature(blockchainConfig), CacheModule.register()],
  controllers: [GetVotesController, GetStatsController],
  providers: [BlockchainService, VoteService, StatsService, BlockchainCommands],
  exports: [BlockchainService],
})
export class BlockchainModule {}
