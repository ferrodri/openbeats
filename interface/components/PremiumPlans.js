import { Container, Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import { Plan } from './Plan';

// TODO: frh -> change plans to equal rates
const plans = [
    {
        heading: 'Low',
        price: '2.00',
        hours: '10',
        img: 'https://gateway.pinata.cloud/ipfs/QmdbkXn12vg4v4JhCUExKDASU3qcMAwnDYAB1UpBVREhCh'
    },
    {
        heading: 'Standard',
        price: '5.00',
        hours: '45',
        img: 'https://gateway.pinata.cloud/ipfs/QmVa93Yrm4NwCRP9Hj1dFzEd5cHcZWRPiFUvg4kkEFBBTr'
    },
    {
        heading: 'Fan',
        price: '9.00',
        hours: '100',
        img: 'https://gateway.pinata.cloud/ipfs/QmYs6e1QJ3RWSHyoLM9jtMdqEV4xpkZhfYcrrGyfxPGsRj'
    },
    {
        heading: 'Disco',
        price: '15.00',
        hours: '200',
        img: 'https://gateway.pinata.cloud/ipfs/QmcN8zyaR7vYEGSBu2yYU46EJaMYoTz7Rrvc6Xd44cEsfY'
    },
    {
        heading: 'Star',
        price: '20.00',
        hours: '350',
        img: 'https://gateway.pinata.cloud/ipfs/QmXpCHhLmyVY2h15x46fr2tpAfn3cLnAEH9oA7ET8Nq39E'
    }
];

export function PremiumPlans() {

    return (
        <>
            <Heading as='h1' size='xl' textAlign='center'>
                Choose your premium monthly plan from $2.00
            </Heading>
            <Grid
                templateColumns='repeat(5, 1fr)'
                gap={6}
                border='1px solid #2d2d2d'
                margin='50px'
                padding='24px'
                borderRadius='12px'
                alignItems='center'
            >
                {plans.map((plan, i) =>
                    <GridItem key={i}>
                        <Plan plan={plan} key={i} />
                    </GridItem>
                )}
            </Grid>
            <Container>
                {/* TODO: style this and add more marketing like beast streaming quality bla bla */}
                <Text><b>*</b>Payment will be done in USDC, $1 = 1USDC</Text>
            </Container>
        </>
    );
}