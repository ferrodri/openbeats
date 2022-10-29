const assert = require('chai').assert;
const { BigNumber } = require('ethers');

describe('Fractional Song NFT with On-Chain Royalty Distribution System', () => {

    it('Mint Song NFTs', async () => {
        const [
            , { address: user2 }, { address: user3 }
            // eslint-disable-next-line no-undef
        ] = await ethers.getSigners();
        // eslint-disable-next-line no-undef
        const SongFactory = await ethers.getContractFactory('Song');

        const Song = await SongFactory.deploy();
        const targetSong = await Song.deployed();
        // Mint NFT
        await targetSong.mintToken(user2, 'ipfsUri');
        await targetSong.mintToken(user3, 'ipfsUri2');

        // Fetch Owner Address
        const owner1 = await targetSong.ownerOf(1);
        const owner2 = await targetSong.ownerOf(2);

        await assert.equal(user2, owner1);
        await assert.equal(user3, owner2);
    });

    it('Basic FSong Contract Test', async () => {
        // eslint-disable-next-line no-undef
        const [{ address: user1 }] = await ethers.getSigners();
        // eslint-disable-next-line no-undef
        const FSongFactory = await ethers.getContractFactory('FSong');

        const FSong = await FSongFactory.deploy(1000);
        const fSong = await FSong.deployed();

        const balance = await fSong.balanceOf(user1);

        await assert.equal(balance, 1000);

    });

    it('Verify if FNFT(FSong) claim of NFT(Song) is true', async () => {
        // eslint-disable-next-line no-undef
        const [{ address: user1 }] = await ethers.getSigners();
        // eslint-disable-next-line no-undef
        const SongFactory = await ethers.getContractFactory('Song');

        const Song = await SongFactory.deploy();
        const SongContract = await Song.deployed();

        await SongContract.mintToken(user1, 'ipfsUri');
        const nftOwner = await SongContract.ownerOf(1);
        await assert.equal(user1, nftOwner);

        // eslint-disable-next-line no-undef
        const FSongFactory = await ethers.getContractFactory('FSong');

        const FSong = await FSongFactory.deploy(1000);
        const fSongContract = await FSong.deployed();

        // Sets the Address & TokenID of NFT to FSong Contract
        await fSongContract.setTargetNFT(SongContract.address, 1);

        // Send ownership of NFT(TokenID=4) to FSong
        await SongContract.transferFrom(user1, fSongContract.address, BigNumber.from(1));

        const balance = await fSongContract.balanceOf(user1);
        await assert.equal(balance.toString(), '1000');

        const { 0: nftContract, 1: nftTokenId } = await fSongContract.targetNFT();
        await assert.equal(SongContract.address, nftContract);
        await assert.equal(fSongContract.address, await SongContract.ownerOf(nftTokenId));
    });

    it('Should be able to send royalty to FSong', async () => {
        // eslint-disable-next-line no-undef
        const [{ address: user1 }] = await ethers.getSigners();
        // eslint-disable-next-line no-undef
        const SongFactory = await ethers.getContractFactory('Song');

        const Song = await SongFactory.deploy();
        const SongContract = await Song.deployed();

        await SongContract.mintToken(user1, 'ipfsUri');
        const nftOwner = await SongContract.ownerOf(1);
        await assert.equal(user1, nftOwner);

        // eslint-disable-next-line no-undef
        const FSongFactory = await ethers.getContractFactory('FSong');

        const FSong = await FSongFactory.deploy(1000);
        const fSongContract = await FSong.deployed();

        // Sets the Address & TokenID of NFT to FSong Contract
        await fSongContract.setTargetNFT(SongContract.address, 1);

        // Send ownership of NFT(TokenID=4) to FSong
        await SongContract.transferFrom(user1, fSongContract.address, BigNumber.from(1));

        const balance = await fSongContract.balanceOf(user1);
        await assert.equal(balance.toString(), '1000');

        const { 0: nftContract, 1: nftTokenId } = await fSongContract.targetNFT();
        await assert.equal(SongContract.address, nftContract);
        await assert.equal(fSongContract.address, await SongContract.ownerOf(nftTokenId));
        // eslint-disable-next-line no-undef
        await fSongContract.sendRoyalty({ value: await ethers.utils.parseEther('3') });

        const royaltyCounter = await fSongContract.getContractRoyaltyCounter();
        await assert.equal(royaltyCounter, 1);
    });

    it('Should be able to withdraw royalty received', async () => {
        // eslint-disable-next-line no-undef
        const [{ address: user1 }] = await ethers.getSigners();
        // eslint-disable-next-line no-undef
        const SongFactory = await ethers.getContractFactory('Song');

        const Song = await SongFactory.deploy();
        const SongContract = await Song.deployed();

        await SongContract.mintToken(user1, 'ipfsUri');
        const nftOwner = await SongContract.ownerOf(1);
        await assert.equal(user1, nftOwner);

        // eslint-disable-next-line no-undef
        const FSongFactory = await ethers.getContractFactory('FSong');

        const FSong = await FSongFactory.deploy(1000);
        const fSongContract = await FSong.deployed();

        // Sets the Address & TokenID of NFT to FSong Contract
        await fSongContract.setTargetNFT(SongContract.address, 1);

        // Send ownership of NFT(TokenID=4) to FSong
        await SongContract.transferFrom(user1, fSongContract.address, BigNumber.from(1));

        const balance = await fSongContract.balanceOf(user1);
        await assert.equal(balance.toString(), '1000');

        const { 0: nftContract, 1: nftTokenId } = await fSongContract.targetNFT();
        await assert.equal(SongContract.address, nftContract);
        await assert.equal(fSongContract.address, await SongContract.ownerOf(nftTokenId));
        // eslint-disable-next-line no-undef
        await fSongContract.sendRoyalty({ value: await ethers.utils.parseEther('3') });

        const royaltyCounter = await fSongContract.getContractRoyaltyCounter();
        await assert.equal(royaltyCounter, 1);
        // eslint-disable-next-line no-undef
        const balanceBefore = await ethers.provider.getBalance(user1);

        await fSongContract.withdrawRoyalty({ from: user1 });
        // eslint-disable-next-line no-undef
        const balanceAfter = await ethers.provider.getBalance(user1);
        // eslint-disable-next-line no-undef
        await assert.equal((parseFloat(ethers.utils.formatEther(balanceBefore)) + parseFloat('3')).toFixed(2), Number.parseFloat(ethers.utils.formatEther(balanceAfter)).toFixed(2));
    });

    it('Should be able to distribute royalty according to share', async () => {
        const [
            { address: user1 }, { address: user2 }, signer
            // eslint-disable-next-line no-undef
        ] = await ethers.getSigners();
        const { address: user3 } = signer;
        // eslint-disable-next-line no-undef
        const SongFactory = await ethers.getContractFactory('Song');

        const Song = await SongFactory.deploy();
        const SongContract = await Song.deployed();

        await SongContract.mintToken(user1, 'ipfsUri');
        const nftOwner = await SongContract.ownerOf(1);
        await assert.equal(user1, nftOwner);

        // eslint-disable-next-line no-undef
        const FSongFactory = await ethers.getContractFactory('FSong');

        const FSong = await FSongFactory.deploy(1000);
        const fSongContract = await FSong.deployed();

        // Sets the Address & TokenID of NFT to FSong Contract
        await fSongContract.setTargetNFT(SongContract.address, 1);

        // Send ownership of NFT(TokenID=4) to FSong
        await SongContract.transferFrom(user1, fSongContract.address, BigNumber.from(1));

        const balance = await fSongContract.balanceOf(user1);
        await assert.equal(balance.toString(), '1000');

        const { 0: nftContract, 1: nftTokenId } = await fSongContract.targetNFT();
        await assert.equal(SongContract.address, nftContract);
        await assert.equal(fSongContract.address, await SongContract.ownerOf(nftTokenId));

        const tokenShare = 333;
        // Send 333 to User2
        await fSongContract.transfer(user2, tokenShare);
        const user2Balance = await fSongContract.balanceOf(user2);
        await assert.equal(parseInt(user2Balance), tokenShare);

        // Send 333 to User3
        await fSongContract.transfer(user3, tokenShare);
        const user3Balance = await fSongContract.balanceOf(user3);
        await assert.equal(parseInt(user3Balance), tokenShare);

        // Get User1 Balance
        const user1Balance = await fSongContract.balanceOf(user1);
        await assert.equal(parseInt(user1Balance), 1000 - 333 - 333);

        // Sign as it was user3
        fSongContract.connect(user3);
        // eslint-disable-next-line no-undef
        await fSongContract.sendRoyalty({ value: await ethers.utils.parseEther('3') });

        const royaltyCounter = await fSongContract.getContractRoyaltyCounter();
        await assert.equal(royaltyCounter, 1);

        // eslint-disable-next-line no-undef
        let balanceBefore = await ethers.provider.getBalance(user1);
        // eslint-disable-next-line no-undef
        console.log('Balance user 1 Before Withdrawal : ', ethers.utils.formatEther(balanceBefore));
        fSongContract.connect(user1);
        await fSongContract.withdrawRoyalty();
        // eslint-disable-next-line no-undef
        let balanceAfter = await ethers.provider.getBalance(user1);
        // eslint-disable-next-line no-undef
        console.log('Balance user 1 After Withdrawal : ', ethers.utils.formatEther(balanceAfter));
        // eslint-disable-next-line no-undef
        await assert.equal((parseFloat(ethers.utils.formatEther(balanceBefore)) + parseFloat('1.00')).toFixed(2), Number.parseFloat(ethers.utils.formatEther(balanceAfter)).toFixed(2));
    });

});