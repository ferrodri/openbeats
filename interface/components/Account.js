import { useAccount } from 'wagmi';
import { Text } from '@chakra-ui/react';

export function Account() {
    const { address } = useAccount();

    return (<Text padding='10px'> Welcome {address} </Text>);
}