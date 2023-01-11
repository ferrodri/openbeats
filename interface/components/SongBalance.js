import { useState } from 'react';
import { useContractRead } from 'wagmi';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';

export function SongBalance({ address }) {
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState('');

    useContractRead({
        address: SONG_CONTRACT_ADDRESS,
        abi: SongABI.abi,
        functionName: 'balanceOf',
        args: [address],
        onSuccess(data) {            
            setIsLoading(false);
            setBalance(parseInt(data));
        },
        onError(error) {
            setIsLoading(false);
            setError(error);
        },
        watch: true
    });

    return (
        <>
            {
                error && <span className='error'>
                    Error: {error.message ? error.message : JSON.stringify(error)}
                </span>
            }
            {isLoading && <span>Loading Song NFT balance ...</span>}
            {!isLoading && !error && <p><b>Song NFT balance:</b> {balance}</p>}
        </>
    );
}