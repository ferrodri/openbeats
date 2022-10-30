import { useDisclosure, useToast } from '@chakra-ui/react';
import SongsABI from '../../contracts/artifacts/contracts/Songs.sol/Songs.json';
import { SONGS_CONTRACT_ADDRESS, USDC_DECIMALS } from '../shared/constants';
import { useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Yup from 'yup';
import { ethers, BigNumber } from 'ethers';
import { parseDecimal } from '../shared/utils';

export function Stream() {
    const { write } = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: SONGS_CONTRACT_ADDRESS,
        abi: SongsABI.abi,
        functionName: 'sendRoyalties',
        onSuccess() {
            console.log('hola');
        },
        onError(error) {
        }
    });
}