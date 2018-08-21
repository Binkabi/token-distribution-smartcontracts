require('babel-polyfill');
require('babel-register')({
  ignore: /node_modules\/(?!openzeppelin-solidity)/,
});

const TestRPC = require('ganache-cli');
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      provider: TestRPC.provider(),
      network_id: '*', // Match any network id
    },
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },
    coverage: {
      host: 'localhost',
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
      network_id: '*', // Match any network id
    },
    rinkeby: {
      provider: () => {
        if (process.env.MNEMONIC) {
          return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.infura.io');
        }
        return TestRPC.provider();
      },
      gas: 2900000,
      gasPrice: 120000000,
      network_id: 4,
    },
    tomo: {
      provider: () => {
        if (process.env.MNEMONIC) {
          return new HDWalletProvider(process.env.MNEMONIC, 'https://testnet.tomochain.com');
        }
        return TestRPC.provider();
      },
      network_id: 89,
    },
    ropsten: {
      provider: () => {
        if (process.env.MNEMONIC) {
          return new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.infura.io');
        }
        return TestRPC.provider();
      },
      network_id: 3,
    },
    kovan: {
      provider: () => {
        if (process.env.MNEMONIC) {
          return new HDWalletProvider(process.env.MNEMONIC, 'https://kovan.infura.io');
        }
        return TestRPC.provider();
      },
      network_id: 42,
    },
  },
};
