const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Staking Token
    const Token = await hre.ethers.getContractFactory("Token");
    const stakingToken = await Token.deploy();
    await stakingToken.waitForDeployment();
    console.log("Staking Token deployed to:", await stakingToken.getAddress());

    // Deploy Reward Token
    const rewardToken = await Token.deploy();
    await rewardToken.waitForDeployment();
    console.log("Reward Token deployed to:", await rewardToken.getAddress());

    // Deploy YieldFarm Contract
    const YieldFarm = await hre.ethers.getContractFactory("YieldFarm");
    const yieldFarm = await YieldFarm.deploy(await stakingToken.getAddress(), await rewardToken.getAddress());
    await yieldFarm.waitForDeployment();
    console.log("YieldFarm deployed to:", await yieldFarm.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

