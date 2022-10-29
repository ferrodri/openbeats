// SPDX-License-Identifier: ISC
pragma solidity =0.8.17;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/**
 * @title Standard FNFT Token(EIP3602) with On-Chain Royalty Distribution System.
 *
 * @dev Implementation of the FNFT with Royalty Distribution System. (EIP3602)
 */
contract FSong is IERC20 {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowed;

    uint256 private _totalSupply;

    // NFT Contract Address
    address private _targetToken;

    // NFT ID of NFT(RFT) - TokenId
    uint256 private _targetTokenId;

    // Admin Address to Set the Parent NFT
    address private _admin;

    // EIP3602 Variables
    mapping(address => uint256) public userIndex;
    mapping(address => bool) public ownerHistory;

    struct Info {
        uint256 balances;
        uint256 royaltyIndex;
    }
    Info[] userInfo;

    struct RoyaltyInfo {
        Info[] userInfo;
        uint256 royalty;
    }
    RoyaltyInfo[] royaltyInfo;

    uint256 public royaltyCounter = 0;

    /**
    @dev 'RoyaltySent' MUST emit when royalty is given.
    The '_sender' argument MUST be the address of the account sending(giving) royalty to token owners.
    The '_value' argument MUST be the value(amount) of ether '_sender' is sending to the token owners.
    **/
    event RoyaltyReceived(address indexed _sender, uint256 _value);

    /**
    @dev 'RoyaltyWithdrawal' MUST emit when royalties are withdrawn.
    The '_withdrawer' argument MUST be the address of the account withdrawing royalty of his portion.
    The '_value' argument MUST be the value(amount) of ether '_withdrawer' is withdrawing.
    **/
    event RoyaltyWithdrawal(address indexed _withdrawer, uint256 _value);

    constructor(uint256 total_supply) {
        _totalSupply = total_supply;
        //_balances[msg.sender] = total_supply;
        ownerHistory[msg.sender] = true;
        userIndex[msg.sender] = uint256(userInfo.length);
        userInfo.push(Info(_totalSupply, royaltyCounter));
        _admin = msg.sender;
    }

    function getIndex() public view returns (uint256) {
        return userIndex[msg.sender];
    }

    function getTotalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /// Royalty counter from how many times has the user withdrawed his royalty
    function getRoyaltyCounter() public view returns (uint256) {
        return userInfo[userIndex[msg.sender]].royaltyIndex;
    }

    function getZeroBalance() public view returns (uint256) {
        return userInfo[0].balances;
    }

    function showBalance() public view returns (uint256) {
        return userInfo[userIndex[msg.sender]].balances;
    }

    /// Royalty counter from the FNFT
    function getContractRoyaltyCounter() public view returns (uint256) {
        return royaltyCounter;
    }

    function sendRoyalty() public payable returns (bool) {
        royaltyCounter += 1;
        uint256 newIndex = royaltyInfo.length;
        royaltyInfo.push();
        royaltyInfo[newIndex].userInfo = userInfo;
        royaltyInfo[newIndex].royalty = msg.value;

        // Emit EVENT
        emit RoyaltyReceived(msg.sender, msg.value);
        return true;
    }

    function withdrawRoyalty() public payable {
        if (
            !ownerHistory[msg.sender] ||
            userInfo[userIndex[msg.sender]].royaltyIndex == royaltyCounter
        ) return;
        uint256 royaltySum = 0; // temporary holder of royalty sum
        uint256 ratio;
        uint256 i;
        for (
            i = userInfo[userIndex[msg.sender]].royaltyIndex;
            i < royaltyCounter;
            i++
        ) {
            // royaltySum += (royaltyInfo[i].userInfo[userIndex[msg.sender]].balances * royaltyInfo[i].royalty) / _totalSupply;
            ratio =
                royaltyInfo[i].userInfo[userIndex[msg.sender]].balances *
                royaltyInfo[i].royalty;

            royaltySum += ratio / _totalSupply;
            uint256 modu = ratio % _totalSupply;
            if (modu != ratio) {
                royaltySum += modu;
            }

            if (gasleft() <= 2100) break;
        }
        userInfo[userIndex[msg.sender]].royaltyIndex = i;

        (bool sent, ) = (msg.sender).call{value: royaltySum}('');
        require(sent, 'Failed to withdraw Royalty');

        emit RoyaltyWithdrawal(msg.sender, royaltySum);
    }

    /**
     * @dev Mandatory function to receive NFT as a contract(CA)
     * @return Bytes4 which is the selector of this function
     */
    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    /**
     * @dev (ERC165) Determines if this contract supports Re-FT(ERC1633).
     * @param interfaceID The bytes4 to query if it matches with the contract interface id.
     */
    function supportsInterface(bytes4 interfaceID)
        external
        pure
        returns (bool)
    {
        return
            interfaceID == this.supportsInterface.selector || //ERC165
            interfaceID == this.targetNFT.selector || // targetNFT()
            interfaceID == this.sendRoyalty.selector || // sendRoyalty()
            interfaceID == this.withdrawRoyalty.selector || // withdrawRoyalty()
            interfaceID ==
            this.targetNFT.selector ^
                this.sendRoyalty.selector ^
                this.withdrawRoyalty.selector; // FNFT
    }

    /**
     * @dev Sets the Address of NFT Contract Address & NFT Token ID
     * @param targetNFTContractAddress The address NFT Contract address.
     * @param targetNFTTokenId The token id of NFT.
     */
    function setTargetNFT(
        address targetNFTContractAddress,
        uint256 targetNFTTokenId
    ) public {
        require(
            msg.sender == _admin,
            'Only Admin can set the Target NFT Token'
        );
        _targetToken = targetNFTContractAddress;
        _targetTokenId = targetNFTTokenId;
    }

    /**
     * @dev Returns the Address of NFT Contract & Token ID of NFT
     * @return An Address representing the address of NFT Contract this FNFT is pointing to.
     * @return An uint256 representing the token id of NFT
     */
    function targetNFT() external view returns (address, uint256) {
        return (_targetToken, _targetTokenId);
    }

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) public view override returns (uint256) {
        // return _balances[owner];
        return userInfo[userIndex[owner]].balances;
    }

    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowed[owner][spender];
    }

    /**
     * @dev Transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value)
        public
        override
        returns (bool)
    {
        require(spender != address(0));

        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another.
     * Note that while this function emits an Approval event, this is not required as per the specification,
     * and other compliant implementations may not emit the event.
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override returns (bool) {
        _allowed[from][msg.sender] = _allowed[from][msg.sender] - value;
        _transfer(from, to, value);
        emit Approval(from, msg.sender, _allowed[from][msg.sender]);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address spender, uint256 addedValue)
        public
        returns (bool)
    {
        require(spender != address(0));

        _allowed[msg.sender][spender] =
            _allowed[msg.sender][spender] +
            addedValue;
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        returns (bool)
    {
        require(spender != address(0));

        _allowed[msg.sender][spender] =
            _allowed[msg.sender][spender] -
            subtractedValue;
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal {
        require(to != address(0));

        if (ownerHistory[to] != true) {
            ownerHistory[to] = true;
            userIndex[to] = userInfo.length;
            userInfo.push(Info(0, royaltyCounter));
        }

        userInfo[userIndex[from]].balances =
            userInfo[userIndex[from]].balances -
            value;
        userInfo[userIndex[to]].balances =
            userInfo[userIndex[to]].balances +
            value;

        emit Transfer(from, to, value);
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of balances such that the
     * proper events are emitted.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply + value;
        userInfo[userIndex[account]].balances =
            userInfo[userIndex[account]].balances +
            value;

        emit Transfer(address(0), account, value);
    }
}
