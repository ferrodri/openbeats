// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const IERC20_SOURCE = '@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20';
const USDC_IMPERSONATE_ADDRESS = '0xfB68C1eEc4F7930c8774Ede7fB0d6E0d037a6aFB';
const USDC_ADDRESS = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83';
const USDC_DECIMALS = 6;

async function main() {
    // eslint-disable-next-line no-undef
    const [{ address }] = await ethers.getSigners();

    // Impersonate account to get some tokens
    // eslint-disable-next-line no-undef
    await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [USDC_IMPERSONATE_ADDRESS],
    });

    // eslint-disable-next-line no-undef
    const signer = await ethers.provider.getSigner(USDC_IMPERSONATE_ADDRESS);
    // eslint-disable-next-line no-undef
    let USDCContract = await hre.ethers.getContractAt(IERC20_SOURCE, USDC_ADDRESS, signer);
    USDCContract = USDCContract.connect(signer);

    // eslint-disable-next-line no-undef
    await USDCContract.approve(signer._address, ethers.utils.parseUnits('100.00', USDC_DECIMALS));
    // eslint-disable-next-line no-undef
    await USDCContract.transferFrom(signer._address, address, ethers.utils.parseUnits('100.00', USDC_DECIMALS));

    let balance = await USDCContract.balanceOf(address);
    // eslint-disable-next-line no-undef
    console.log('balance: ', ethers.utils.formatUnits(balance, USDC_DECIMALS), address);

    // eslint-disable-next-line no-undef
    const SongFactory = await ethers.getContractFactory('Song');

    const Song = await SongFactory.deploy();

    await Song.deployed();

    console.log('Song contract deployed to:', Song.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
