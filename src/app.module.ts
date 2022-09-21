import { Module } from '@nestjs/common';
import { EtherscanModule } from './modules/etherscan/etherscan.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ConsoleModule } from 'nestjs-console';
import { CoreModule } from './modules/core/core.module';
import { ConfigModule } from '@nestjs/config';
import { PayoutModule } from './modules/payout/payout.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CoreModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(),
    EtherscanModule,
    BlockchainModule,
    ConsoleModule,
    PayoutModule,
  ],
})
export class AppModule {}
