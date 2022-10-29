require('@nomicfoundation/hardhat-toolbox');
require('hardhat-contract-sizer');

module.exports = {
    contractSizer: { runOnCompile: true },
    solidity: '0.8.17',
    networks: {
        hardhat: {
            forking: {
                url: 'https://rpc.gnosischain.com/',
            }
        }
    }
    // gnosis: {
    //     url: 'https://rpc.gnosischain.com/',
    // accounts: {
    //     // private keys
    //     mnemonic: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],,
    // },
    // },
};
