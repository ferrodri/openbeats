// SPDX-License-Identifier: ISC
pragma solidity =0.8.17;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

import 'hardhat/console.sol';

contract Swap {
    address public constant USDC = 0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83;

    // Token on sale   Owner                salePrice        saleQuantity
    mapping(address => mapping(address => mapping(uint256 => uint256))) private _onSale;

    constructor() {}

    // será esto y allow
    // TODO: frh -> event in both of them
    function startSale(
        address saleToken,
        uint256 salePrice,
        uint256 saleQuantity
    ) public {
        _onSale[saleToken][msg.sender][salePrice] = saleQuantity;
    }

    // será esto y allow
    function buy(
        address saleToken,
        address seller,
        uint256 salePrice,
        uint256 buyQuantity
    ) public {
        uint256 saleQuantity = _onSale[saleToken][seller][salePrice];
        require(
            saleQuantity >= buyQuantity,
            'not enough offer to cover demand'
        );

        uint256 amount = salePrice * buyQuantity;
        TransferHelper.safeTransferFrom(USDC, msg.sender, seller, amount);
        TransferHelper.safeTransferFrom(saleToken, seller, msg.sender, buyQuantity);
        console.log('antes de comprar', _onSale[saleToken][seller][salePrice]);

        _onSale[saleToken][seller][salePrice] -= buyQuantity;
        console.log('despues de comprar', _onSale[saleToken][seller][salePrice]);
    }
}
