import { useState } from 'react';
import { useContractRead } from 'wagmi';
// Just need a ERC20ABI because USDC contract not on gnosisscan
import ERC20ABI from '../shared/ERC20.json';
import { USDC_CONTRACT_ADDRESS } from '../shared/constants';
import { parseDecimal } from '../shared/utils';

export function Balance({ address }) {
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState('');

    useContractRead({
        address: USDC_CONTRACT_ADDRESS,
        abi: ERC20ABI.abi,
        functionName: 'balanceOf',
        args: [address],
        onSuccess(data) {
            setIsLoading(false);
            setBalance(parseDecimal(data));
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
            {isLoading && <span>Loading USDC balance ...</span>}
            {!isLoading && !error && <p><b>USDC balance:</b> {balance}</p>}
        </>
    );
}