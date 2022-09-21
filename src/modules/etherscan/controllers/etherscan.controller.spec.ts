import { Test, TestingModule } from '@nestjs/testing';
import { EtherscanController } from './etherscan.controller';
import { EtherscanService } from '../services/etherscan.service';
import { HttpModule } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';
describe('EtherscanController', () => {
  let etherscanController: EtherscanController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [EtherscanController],
      providers: [EtherscanService],
    }).compile();

    etherscanController = app.get<EtherscanController>(EtherscanController);
  });

  describe('etherscan', () => {
    it('should return a "NOT_FOUND" exception when ApiKey is invalid', async  () => {
      try {
        await etherscanController.getCirculatingSupply('badApiKey')
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
      }
    });
  });
});
