import Head from 'next/head';
import * as React from 'react';
import { useAccount } from '@web3modal/react';
import { Connect, SongBalance } from '../components';
import { useIsMounted } from '../hooks';
import { Container, Heading } from '@chakra-ui/react';

function Songs() {
    const isMounted = useIsMounted();
    const { account: { isConnected, address } } = useAccount();

    return (
        <div>
            <Head>
                <title>OpenBeats</title>
                <meta name="description" content="All your favorite songs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Container display='flex' justifyContent='space-between' marginTop='16px'>
                    <Heading as='h1' size='xl' padding='8px' fontSize='20px' color='#3542c6' fontWeight='900'>
                        Open<span style={{ 'color': 'white' }}>Beats</span>
                    </Heading>
                    <Connect />
                </Container>
                {isMounted && isConnected
                    && (
                        <Container
                            display='flex'
                            flexDirection='column'
                            minWidth='1000px'
                            margin='0 auto'
                            paddingRight='45px'
                        >
                            <SongBalance address={address} />
                        </Container >
                    )
                }
            </main>
        </div>
    );
}

export default Songs;