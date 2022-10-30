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
                {/* TODO: this description */}
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Account address={address} />
                {
                    isMounted && isConnected
                        ? (
                            <Container
                                display='flex'
                                flexDirection='column'
                                minWidth='1000px'
                                margin='0'
                                paddingRight='45px'
                            >
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
            </main>
        </div>
    );
}

export default UploadSongPage;