import { useAccount, useDisconnect, useConnectModal } from '@web3modal/react';

export function Connect() {
    const { account: { isConnected } } = useAccount();
    const { open } = useConnectModal();

    const disconnect = useDisconnect();

    return (
        <>
            {
                isConnected
                    ? <button onClick={() => disconnect()}>
                        Logout
                    </button>
                    : <button className='primary-button' style={{display:'flex', borderRadius: '10px', padding: '10px 15px'}} onClick={() => open()}>
                        <svg width="28" height="20" viewBox="0 0 28 20"><g clipPath="url(#a)"><path d="M7.386 6.482c3.653-3.576 9.575-3.576 13.228 0l.44.43a.451.451 0 0 1 0 .648L19.55 9.033a.237.237 0 0 1-.33 0l-.606-.592c-2.548-2.496-6.68-2.496-9.228 0l-.648.634a.237.237 0 0 1-.33 0L6.902 7.602a.451.451 0 0 1 0-.647l.483-.473Zm16.338 3.046 1.339 1.31a.451.451 0 0 1 0 .648l-6.035 5.909a.475.475 0 0 1-.662 0L14.083 13.2a.119.119 0 0 0-.166 0l-4.283 4.194a.475.475 0 0 1-.662 0l-6.035-5.91a.451.451 0 0 1 0-.647l1.338-1.31a.475.475 0 0 1 .662 0l4.283 4.194c.046.044.12.044.166 0l4.283-4.194a.475.475 0 0 1 .662 0l4.283 4.194c.046.044.12.044.166 0l4.283-4.194a.475.475 0 0 1 .662 0Z" fill="white"></path></g><defs><clipPath id="a"><path fill="#ffffff" d="M0 0h28v20H0z"></path></clipPath></defs></svg>
                        <div width='1px'></div>
                        <w3m-text variant="medium-normal" color="inverse" style={{fontSize:'13.3333px'}}>Connect Wallet</w3m-text>
                    </button>
            }
        </>
    );
}