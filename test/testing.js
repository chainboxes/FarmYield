const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YieldFarm Contract", function () {
    let Token, stakingToken, rewardToken, YieldFarm, yieldFarm;
    let owner, user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy staking and reward token
        Token = await ethers.getContractFactory("Token");
        stakingToken = await Token.deploy();
        rewardToken = await Token.deploy();

        await stakingToken.waitForDeployment();
        await rewardToken.waitForDeployment();

        // Deploy YieldFarm contract
        YieldFarm = await ethers.getContractFactory("YieldFarm");
        yieldFarm = await YieldFarm.deploy(await stakingToken.getAddress(), await rewardToken.getAddress());
        await yieldFarm.waitForDeployment();

        // Mint tokens to users
        await stakingToken.transfer(user1.address, ethers.parseEther("1000"));
        await rewardToken.transfer(yieldFarm.target, ethers.parseEther("10000")); // Fund rewards
    });

    it("Should allow users to stake tokens", async function () {
        await stakingToken.connect(user1).approve(yieldFarm.target, ethers.parseEther("100"));
        await yieldFarm.connect(user1).stake(ethers.parseEther("100"));

        expect(await yieldFarm.balances(user1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should allow users to withdraw staked tokens and receive rewards", async function () {
        await stakingToken.connect(user1).approve(yieldFarm.target, ethers.parseEther("100"));
        await yieldFarm.connect(user1).stake(ethers.parseEther("100"));

        // Simulate time passage (fast-forward blockchain time)
        await ethers.provider.send("evm_increaseTime", [10]); // Increase time by 10 seconds
        await ethers.provider.send("evm_mine"); // Mine a block

        await yieldFarm.connect(user1).withdraw();

        // Check final balances
        expect(await stakingToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
        expect(await rewardToken.balanceOf(user1.address)).to.be.above(0); // User should receive rewards
    });
});
