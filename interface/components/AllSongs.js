import { useEffect, useState } from 'react';
import { useProvider, useBlockNumber } from 'wagmi';
import { ethers } from 'ethers';
import { useAccount } from '@web3modal/react';
import { Container, Heading } from '@chakra-ui/react';
import { SongCardBuy } from './SongCardBuy';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS } from '../shared/constants';

export function AllSongs() {
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

                const tokenIds = logs.map((log) => {
                    const tokenId = songsContract.interface.parseLog(log).args[3].toNumber();
                    return tokenId;
                });
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                var uniqueTtokenIds = tokenIds.filter(onlyUnique);
                setSongs(uniqueTtokenIds);
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
            {isLoading && <span>Loading songs ...</span>}
            <Container display='flex' flexDirection='column'>
                <Heading as='h1' size='xl' textAlign='center'>
                    GM Fren!
                    <br></br>
                    BD amigo!
                </Heading>
                {songs.map((_tokenId, i) =>
                    <SongCardBuy tokenId={_tokenId} key={i} />
                )}
            </Container>
        </>
    );
};