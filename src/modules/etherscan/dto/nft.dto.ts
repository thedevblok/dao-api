import { Nft } from '../entities/nft.entity';

export class NftDto {
  editionNumber: number;
  name: string;
  updatedAt: Date;
  address: string;
  minted: boolean;
  transferred: boolean;
  ethTransaction: number;
  imageUrl: string;
  openSeaUrl: string;
}

export class NftToDtoTransformer {
  public convertNftToDto(nft: Nft): NftDto {
    return {
      editionNumber: nft.editionNumber,
      name: `GlobeHeads Edition #${nft.editionNumber}`,
      updatedAt: nft.updatedAt,
      address: nft.address,
      minted: nft.minted,
      transferred: nft.transferred,
      ethTransaction: nft.ethTransaction,
      imageUrl: `https://globeheadsnft.mypinata.cloud/ipfs/Qmem5gLYGHZvbAuqzr3ZKmtPAN1wtGy2YDaQSrV34WbKcM/${nft.editionNumber}.png`,
      openSeaUrl: `https://opensea.io/assets/matic/0x30748e684ebd20aee9e4c4dfa75c0da6a9c623d1/${nft.editionNumber}`,
    };
  }
}
