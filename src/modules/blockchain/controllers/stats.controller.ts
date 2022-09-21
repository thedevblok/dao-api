import {
  BadRequestException,
  CacheInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { StatsService } from '../services/stats.service';

@Controller('api')
export class GetStatsController {
  constructor(private stats: StatsService) {}

  @UseInterceptors(CacheInterceptor)
  @Get('get-total-locked-amount')
  async getTotalLockedAmount(): Promise<number> {
    return await this.stats.getTotalLockedAmount();
  }

  @UseInterceptors(CacheInterceptor)
  @Get('locked-amounts-per-week')
  async getLockedAmountsBy(@Query('weeks') weeks: number): Promise<number> {
    return await this.stats.getLockedAmountsPerWeeks(weeks);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('get-next-period-total-weight')
  async getNextPeriodTotalWeight(
    @Query('address') address: string,
  ): Promise<any> {
    const currentAddress = address ? address : null;

    return await this.stats.getPeriodTotalWeight(currentAddress);
  }

  @Get('get-payout-list')
  async getPayoutList(
    @Query('date') date: string,
    @Query('amount') amount: string,
  ) {
    const payoutList = await this.stats.getPayoutList(date, amount);
    return payoutList;
  }
}
