import Head from 'next/head';
import * as React from 'react';
import { useAccount } from '@web3modal/react';
import { Account, Connect, UploadSong } from '../components';
import { useIsMounted } from '../hooks';
import { Container, Heading } from '@chakra-ui/react';

function Home() {
    const isMounted = useIsMounted();
    const { account: { isConnected, address } } = useAccount();

    return (
        <div>
            <Head>
                <title>OpenBeats</title>
                {/* TODO: this description */}
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Container display='flex' justifyContent='space-around' marginTop='16px' minWidth='600px'>
                    <>
                        {
                            isMounted && isConnected
                                ? (
                                    <Container>
                                        <Account address={address} />
                                        <UploadSong address={address} />
                                    </Container >
                                )
                                : <>
                                    <Heading as='h1' size='l' padding='8px'>
                                        OpenBeats
                                    </Heading>
                                    <Connect />
                                </>
                        }
                    </>
                </Container>
            </main>
        </div>
    );
}

export default Home;