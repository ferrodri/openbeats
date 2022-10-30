import Head from 'next/head';
import * as React from 'react';
import { useAccount } from '@web3modal/react';
import { Account, Connect, UploadSong } from '../components';
import { useIsMounted } from '../hooks';
import { Container, Heading } from '@chakra-ui/react';

function UploadSongPage() {
    const isMounted = useIsMounted();
    const { account: { isConnected, address } } = useAccount();

    return (
        <div>
            <Head>
                <title>OpenBeats</title>
                <meta name="description" content="Upload your song" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Container display='flex' justifyContent='space-between' marginTop='16px'>
                    <Heading as='h1' size='xl' padding='8px' fontSize='20px' color='#3542c6' font-fontWeight='900'>
                        Open<span style={{ 'color': 'white' }}>Beats</span>
                    </Heading>
                    <Connect />
                </Container>
                {
                    isMounted && isConnected &&
                    (
                        <Container
                            margin='0 auto'
                            display='flex'
                            flexDirection='column'
                            minWidth='1000px'
                            paddingRight='45px'
                        >
                            <UploadSong address={address} />
                        </Container >
                    )
                }
            </main>
        </div>
    );
}

export default UploadSongPage;