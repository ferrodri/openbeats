// SPDX-License-Identifier: ISC
pragma solidity =0.8.17;

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

import 'hardhat/console.sol';

interface SongsInterface {
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;
}

contract Swap {
    address public constant USDC = 0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83;
    address public constant Songs = 0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07;
    SongsInterface SongsContract = SongsInterface(Songs);

    //Owner                     owner             salePrice       saleQuantity
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _onSale;

    struct Sale {
        uint256 salePrice;
        uint256 saleQuantity;
    }
    mapping(uint256 => mapping(address => Sale)) private onSale_;

    constructor() {}

    // será esto y allow
    function startSale(
        uint256 tokenId,
        uint256 salePrice,
        uint256 saleQuantity
    ) public {
        _onSale[tokenId][msg.sender][salePrice] = saleQuantity;
        onSale_[tokenId][msg.sender].salePrice = salePrice;
        onSale_[tokenId][msg.sender].saleQuantity = saleQuantity;
    }

    function getSalePriceQuantity(uint256 tokenId)
        public
        view
        returns (uint256, uint256)
    {
        return (onSale_[tokenId][msg.sender].salePrice, onSale_[tokenId][msg.sender].saleQuantity);
    }

    // será esto y allow
    function buy(
        uint256 tokenId,
        address seller,
        uint256 salePrice,
        uint256 buyQuantity
    ) public {
        uint256 saleQuantity = _onSale[tokenId][seller][salePrice];
        require(
            saleQuantity >= buyQuantity,
            'not enough offer to cover demand'
        );

        uint256 amount = salePrice * buyQuantity;
        TransferHelper.safeTransferFrom(USDC, msg.sender, seller, amount);
        SongsContract.safeTransferFrom(
            seller,
            msg.sender,
            tokenId,
            buyQuantity,
            ''
        );
        //TODO: frh -> check buy and remove log
        // console.log('antes de comprar', _onSale[tokenId][seller][salePrice]);

        _onSale[tokenId][seller][salePrice] -= buyQuantity;
        onSale_[tokenId][msg.sender].saleQuantity = _onSale[tokenId][seller][salePrice];
        // console.log('despues de comprar', _onSale[tokenId][seller][salePrice]);
    }
}
