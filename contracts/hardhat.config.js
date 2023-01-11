require('@nomicfoundation/hardhat-toolbox');
require('hardhat-contract-sizer');


// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = '';

/**
 * Replace this private key with your Goerli account private key
 * To export your private key from Metamask, open Metamask and
 * go to Account Details > Export Private Key
 * Beware: NEVER put real Ether into testing accounts
 * 
 * This is a testing private key
 */
const GOERLI_PRIVATE_KEY = '';


module.exports = {
    contractSizer: { runOnCompile: true },
    solidity: '0.8.17',
    networks: {
        goerli: {
            url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
            accounts: [GOERLI_PRIVATE_KEY]
        },
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
