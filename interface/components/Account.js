import { useAccount } from '@web3modal/react';
import { Text } from '@chakra-ui/react';

export function Account() {
    const { account: { address } } = useAccount();

    return (<Text padding='10px'> Welcome {address} </Text>);
}