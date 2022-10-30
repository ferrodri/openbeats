import { useEffect, useState } from 'react';
import { useProvider, useBlockNumber } from 'wagmi';
import { ethers } from 'ethers';
import { useAccount } from '@web3modal/react';
import { Container, Heading } from '@chakra-ui/react';
import { SongCard } from './SongCard';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS } from '../shared/constants';

export function PortfolioResume() {
    const provider = useProvider();
    const { account: { address } } = useAccount();
    const { data: blockNumber } = useBlockNumber();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        if (blockNumber, provider, address) {
            const songsContract = new ethers.Contract(
                SONGS_CONTRACT_ADDRESS, SongsABI.abi, provider
            );
            let eventFilter = songsContract.filters.TransferSingle();

            provider.getLogs({
                ...eventFilter,
                fromBlock: 'earliest',
                toBlock: 'latest'
            }).then(logs => {

                const logsMapped = logs.map(log => {
                    const owner = songsContract.interface.parseLog(log).args[0];
                    const tokenId = songsContract.interface.parseLog(log).args[3].toNumber();
                    const numberOfTokens = songsContract.interface.parseLog(log).args[4].toNumber();
                    return { owner, tokenId, numberOfTokens };
                });

                const filteredLogs = logsMapped.filter(({ owner }) => owner === address);

                setSongs(filteredLogs);
                setIsLoading(false);
            }).catch(error => {
                setIsLoading(false);
                setError(error);
            });
        }

    }, [blockNumber, provider, address]);

    return (
        <>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading your song ...</span>}
            <Container display='flex' flexDirection='column'>
                <Heading as='h1' size='xl' textAlign='center'>
                    Resume of your portfolio
                </Heading>
                {songs.map((_song, i) =>
                    <SongCard song={_song} key={i} />
                )}
            </Container>
        </>
    );
};