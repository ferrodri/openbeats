import Head from 'next/head';
import * as React from 'react';
import { useAccount } from '@web3modal/react';
import { Account, Balance, Connect, PremiumPlans } from '../components';
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
                                ? (<> <Account address={address} /> <Balance address={address}/></>)
                                : <>
                                    <Heading as='h1' size='l' padding='8px' fontSize='20px' color='#3542c6' font-fontWeight='900'>
                                        Open<span style={{'color': 'white'}}>Beats</span>
                                    </Heading>
                                    <Connect />
                                </>
                        }
                    </>
                </Container>
                {/* TODO: Premium plans cannot be seen if not logged */}
                <PremiumPlans />
            </main>
        </div>
    );
}

export default Home;