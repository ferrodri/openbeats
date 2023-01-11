// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

async function main() {
    // eslint-disable-next-line no-undef
    const [deployer] = await ethers.getSigners();

    console.log('Deploying contracts with the account:', deployer.address);

    console.log('Account balance:', (await deployer.getBalance()).toString());

    // eslint-disable-next-line no-undef
    const SongFactory = await ethers.getContractFactory('Song');

    const Song = await SongFactory.deploy();

    // await Song.deployed();

    //https://stackoverflow.com/questions/70257820/metamask-rpc-error-execution-reverted-code-32000-message-execution-reve
    console.log(
        'Song contract deployed to, please remember to change address in frontend too:',
        Song.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
