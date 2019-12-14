/**
 * @file constants
 * @author atom-yang
 */
import AElf from 'aelf-sdk';

export const END_POINT = 'http://13.231.179.27:8000';
export const aelf = new AElf(new AElf.providers.HttpProvider(END_POINT));
// PRIVATE KEY FOR DEMO!!!
// eslint-disable-next-line max-len
export const wallet = AElf.wallet.getWalletByPrivateKey('fce01061b3c407108d271c8bf95c46b95c409997ff661a73664489519e458b46');

export const ACCOUNT_INFO = {
  accounts: [
    {
      name: 'test',
      address: 'XxajQQtYxnsgQp92oiSeENao9XkmqbEitDD8CJKfDctvAQmH6',
      // eslint-disable-next-line max-len
      publicKey: '04821c66aa026e3e883eaa964733ebe20a9e7d34b1f6b2ac78dab0700d74caf8127bd7041498abe6e58c6531a2f1c3694bfc8ee8c039c05b697160572b13fbb17b'
    }
  ],
  chains: [
    {
      url: END_POINT,
      isMainChain: true, // 是否为主链
      chainId: 'AELF'
    },
    {
      url: 'http://52.68.97.242:8000',
      isMainChain: false, // 是否为主链
      chainId: '2112'
    },
    {
      url: 'http://52.196.227.200:8000',
      isMainChain: false, // 是否为主链
      chainId: '2113'
    }
  ]
};

export const MESSAGE_PREFIX = 'aelf://aelf.io';

export const CHAIN_APIS = {
  '/api/blockChain/chainStatus': 'getChainStatus',
  '/api/blockChain/blockState': 'getChainState',
  '/api/blockChain/contractFileDescriptorSet': 'getContractFileDescriptorSet',
  '/api/blockChain/blockHeight': 'getBlockHeight',
  '/api/blockChain/block': 'getBlock',
  '/api/blockChain/blockByHeight': 'getBlockByHeight',
  '/api/blockChain/transactionResult': 'getTxResult',
  '/api/blockChain/transactionResults': 'getTxResults',
  '/api/blockChain/merklePathByTransactionId': 'getMerklePathByTxId'
};

export const SUPPORTED_EC = [
  'secp256k1'
];
