import * as React from 'react';
import { Web3Modal } from '@web3modal/react';
import { goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { WagmiConfig, configureChains, createClient, chain } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { globalCSS } from '../styles/globalCSS';

const theme = extendTheme(globalCSS);

const _chains = [goerli, chain.hardhat];
const providers = [
    alchemyProvider({ apiKey: '' }),
    publicProvider(),
    jsonRpcProvider({
        rpc: () => ({
            http: 'http://127.0.0.1:8545/'
        })
    })
];

const { chains, provider, webSocketProvider } = configureChains(
    _chains, providers
);
// TODO: frh -> test both networks
const client = createClient({
    connectors: [new InjectedConnector({ chains: chains })],
    provider,
    webSocketProvider
});

const modalConfig = {
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    theme: 'dark',
    accentColor: 'default',
    ethereum: {
        appName: 'learning-test',
        // autoConnect: false,
        chains: _chains,
        providers: providers
    }
};


function App({ Component, pageProps }) {
    return (
        <ChakraProvider theme={theme}>
            <WagmiConfig client={client}>
                <Component {...pageProps} />
                <Web3Modal config={modalConfig} />
            </WagmiConfig>
        </ChakraProvider>
    );
}

export default App;