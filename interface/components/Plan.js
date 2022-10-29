import { Container, Heading, Image, Text } from '@chakra-ui/react';
import { useContractWrite } from 'wagmi';
import { useAccount } from '@web3modal/react';
// Just need a ERC20ABI because USDC contract not on gnosisscan
import ERC20ABI from '../shared/ERC20.json';
import { USDC_CONTRACT_ADDRESS, USDC_DECIMALS } from '../shared/constants';
import { ethers } from 'ethers';

export function Plan({ plan }) {
    const { account: { address } } = useAccount();
    const { heading, img, price, hours } = plan;

    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: USDC_CONTRACT_ADDRESS,
        abi: ERC20ABI.abi,
        functionName: 'approve',
        onSuccess(bool) {
            // TODO: set this onsuccess and onError, list songs
            console.log('go', bool);
        },
        onError(error) {
            console.log('no go', error);
        }
    });

    return (
        <Container
            w='100%'
            h='100%'
            border='1px solid #2d2d2d'
            margin='12px'
            padding='24px'
            borderRadius='12px'
            display='flex'
            flexDirection='column'
        >
            <Heading as='h2' fontSize='22px' marginBottom='16px' textAlign='center'>
                {heading}
            </Heading>
            <Image src={img} alt={heading} width='82px' margin='auto' />
            <Text textAlign='center' marginTop='16px'><b>{hours} hours of music</b></Text>
            <Text textAlign='center' color='#8b949e'><b>${price}</b></Text>
            <button
                className='primary-button'
                style={{
                    width: '100px',
                    margin: '12px auto 0 auto'
                }}
                onClick={() => write({
                    recklesslySetUnpreparedArgs: [
                        address,
                        ethers.utils.parseUnits(price, USDC_DECIMALS)
                    ]
                })}
            >
                Select
            </button>
        </Container>
    );
}