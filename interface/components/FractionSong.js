import {
    Heading,
    Container
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useBlockNumber, useProvider } from 'wagmi';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';
import { ethers } from 'ethers';

export function FractionSong() {
    const provider = useProvider();
    const { data: blockNumber } = useBlockNumber();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [tokenId, setTokenId] = useState(null);

    useEffect(() => {
        const songContract = new ethers.Contract(
            SONG_CONTRACT_ADDRESS, SongABI.abi, provider
        );
        let eventFilter = songContract.filters.Transfer();

        provider.getLogs({
            ...eventFilter,
            fromBlock: blockNumber - 1,
            toBlock: 'latest'
        }).then(logs => {
            const _log = logs[logs.length - 1];
            const log = songContract.interface.parseLog(_log).args[2].toNumber();
            setTokenId(log);
            setIsLoading(false);
        }).catch(error => {
            setIsLoading(false);
            setError(error);
        });
    }, [blockNumber, provider]);

    return (
        <Container>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading DAO proposals ...</span>}
            <Heading as='h1' size='xl' textAlign='center'>
                How many tokens should your song have?
            </Heading>
        </Container>
    );
};