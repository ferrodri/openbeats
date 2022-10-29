import { useEffect } from 'react';
import { useProvider } from 'wagmi';
import { ethers, BigNumber } from 'ethers';
import FSongABI from '../../contracts/artifacts/contracts/FSong.sol/FSong.json';
import SongABI from '../../contracts/artifacts/contracts/Song.sol/Song.json';
import { SONG_CONTRACT_ADDRESS } from '../shared/constants';
import { useAccount } from '@web3modal/react';

export function DeployFractionSong({ tokensNumber, tokenId }) {
    const provider = useProvider();
    const { account: { address } } = useAccount();

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

            // TODO: frh render song and sell it
        };
        if(provider, tokensNumber, tokenId, address) {
            deployFractionSong();
        }

    }, [provider, tokensNumber, tokenId, address]);


    return (
        <>hola</>
    );
};