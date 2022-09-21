import {
  Controller,
  Get,
  Query,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { getRepository } from 'typeorm';
import {
  EthTransactionDto,
  EthTransactionToDtoTransformer,
} from '../dto/ethTransaction.dto';
import { NftDto, NftToDtoTransformer } from '../dto/nft.dto';
import { Etherscan } from '../entities/etherscan.entity';
import { EthTransaction } from '../entities/ethTransaction.entity';
import { Nft } from '../entities/nft.entity';

@Controller('api')
export class EtherscanController {
  @UseInterceptors(CacheInterceptor)
  @Get('circulating-supply')
  async getCirculatingSupply(@Query('apikey') apikey: string): Promise<string> {
    const repository = getRepository(Etherscan);
    const etherscan = await repository.findOne();
    return etherscan.circulatingSupply;
  }

  @UseInterceptors(CacheInterceptor)
  @Get('number-of-holders')
  async getNumberOfHolders(@Query('apikey') apikey: string): Promise<string> {
    const repository = getRepository(Etherscan);
    const etherscan = await repository.findOne();
    return etherscan.numberOfHolders;
  }

  @UseInterceptors(CacheInterceptor)
  @Get('get-eth-transactions')
  async getEthTransactions(
    @Query('address') address: string,
  ): Promise<EthTransactionDto[]> {
    const repository = getRepository(EthTransaction);
    const ethTransactions = await repository.find({
      where: {
        from: address,
      },
    });
    return ethTransactions.map((ethTransaction: EthTransaction) => {
      return new EthTransactionToDtoTransformer().convertEthTransactionToDto(
        ethTransaction,
      );
    });
  }

  @UseInterceptors(CacheInterceptor)
  @Get('get-nft-list')
  async getNftList(@Query('address') address: string): Promise<NftDto[]> {
    const repository = getRepository(Nft);
    const nfts = await repository.find({
      where: {
        address: address,
      },
      order: {
        editionNumber: 'ASC',
      },
    });
    return nfts.map((nft: Nft) => {
      return new NftToDtoTransformer().convertNftToDto(nft);
    });
  }
}
