import { ethers } from 'ethers';
import { USDC_DECIMALS } from './constants';

export const parseDecimal = (value) => {
    const _value = ethers.utils.formatUnits(value, USDC_DECIMALS);
    return parseFloat(_value).toFixed(2);
};