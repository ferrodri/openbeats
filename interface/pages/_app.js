import * as React from 'react';
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig, configureChains, createClient, chain } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { globalCSS } from '../styles/globalCSS';

const theme = extendTheme(globalCSS);

const { provider, webSocketProvider } = configureChains(
    [chain.hardhat],
    [
        jsonRpcProvider({
            rpc: () => ({
                http: 'http://127.0.0.1:8545/'
            })
        })
    ]
);

const client = createClient({
    connectors: [new InjectedConnector({ chains: [chain.hardhat] })],
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
        chains: [chain.hardhat],
        providers: [
            jsonRpcProvider({
                rpc: () => ({
                    http: 'http://127.0.0.1:8545/'
                })
            })
        ]
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