import { registerAs } from '@nestjs/config';

export default registerAs('blockchain', () => ({
  infura: {
    id: process.env.INFURA_ID,
  },
  provider: {
    name: process.env.PROVIDER,
    url: process.env.PROVIDER_URL,
    nodeNetwork: process.env.NODE_NETWORK,
    chainId: process.env.CHAIN_ID,
  },
  maticProvider: {
    url: process.env.MATIC_PROVIDER_URL,
    chainId: process.env.MATIC_CHAIN_ID,
    privateKey: process.env.MATIC_PRIVATE_KEY
  },
  contractAddress: {
    qao: process.env.QAO_TOKEN_ADDRESS,
    vote: process.env.VOTE_CONTRACT_ADDRESS,
    globeheads: process.env.GLOBEHEADS_CONTRACT_ADDRESS
  },
}));
