// SPDX-License-Identifier: ISC
pragma solidity =0.8.17;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract Song is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721('OpenBeats', 'OBS') {}

    function mintToken(address owner, string memory uri)
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(owner, id);
        /// to store the URI ERC721URIStorage
        _setTokenURI(id, uri);

        return id;
    }
}
