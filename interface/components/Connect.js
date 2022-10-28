import { ConnectButton, useAccount, useDisconnect } from '@web3modal/react';

export function Connect() {
    const { account: { isConnected } } = useAccount();
    const disconnect = useDisconnect();

    return (
        <>
            {
                isConnected
                    ? <button onClick={() => disconnect()}>
                        Logout
                    </button>
                    : <ConnectButton />
            }
        </>
    );
}