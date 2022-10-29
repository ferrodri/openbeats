import { useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import FSongABI from '../../contracts/artifacts/contracts/FSong.sol/FSong.json';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';
import { useAccount } from '@web3modal/react';
import { Container, Grid, GridItem, Heading, useToast } from '@chakra-ui/react';
import { SongCard } from './SongCard';
import { TokensBalance } from './TokensBalance';

export function DeployFractionSong({ tokensNumber, tokenId }) {
    const toast = useToast();
    const provider = useProvider();
    const { account: { address } } = useAccount();
    const [songDeployed, setSongDeployed] = useState(false);

    useEffect(() => {
        const deployFractionSong = async () => {
            const signer = await provider.getSigner(process.env.NEXT_PUBLIC_DEPLOY_ADDRESS);

            const FSongFactory = await new ethers.ContractFactory(FSongABI.abi, FSongABI.bytecode, signer);
            const FSong = await FSongFactory.deploy(tokensNumber);

            await FSong.deployed();

            // Sets the Address & TokenID of NFT to FSong Contract
            await FSong.setTargetNFT(SONG_CONTRACT_ADDRESS, BigNumber.from(tokenId));

            const Song = new ethers.Contract(SONG_CONTRACT_ADDRESS, SongABI.abi, signer);
            await Song.transferFrom(address, FSong.address, BigNumber.from(tokenId));

            setSongDeployed(true);

            toast({
                title: 'Song tokenized correctly!',
                status: 'success',
                duration: 9000,
                containerStyle: {
                    maxHeight: '500px'
                },
                isClosable: true
            });
        };
        if (provider && tokensNumber && tokenId && address && toast && !songDeployed) {
            deployFractionSong();
        }

    }, [provider, tokensNumber, tokenId, address, toast, songDeployed]);


    return (
        <>
            {songDeployed &&
                <>

                    <Heading as='h1' size='xl' textAlign='center'>
                        Resume of your portfolio
                    </Heading>
                    <Grid
                        templateColumns='repeat(2, 1fr)'
                        gap={6}
                        border='1px solid #2d2d2d'
                        margin='50px'
                        padding='24px'
                        borderRadius='12px'
                        alignItems='center'
                    >
                        <GridItem>
                            <SongCard tokenId={tokenId} />
                        </GridItem>
                        <GridItem>
                            <TokensBalance />
                        </GridItem>
                    </Grid >
                </>
            }
        </>

    );
};