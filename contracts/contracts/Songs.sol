// SPDX-License-Identifier: ISC
pragma solidity =0.8.17;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract Songs is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155('https://gateway.pinata.cloud/ipfs/') {}

    function mint(
        address to,
        uint256 amount,
        string memory tokenURI
    ) public virtual returns (uint256) {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();

        _setTokenUri(id, tokenURI);
        super._mint(to, id, amount, '');

        return id;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_tokenURIs[tokenId]);
    }

    function _setTokenUri(uint256 tokenId, string memory tokenURI) private {
        _tokenURIs[tokenId] = tokenURI;
    }
}
