// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldFarm {
    IERC20 public stakingToken;
    IERC20 public rewardToken;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastStakedTime;

    uint256 public rewardRate = 100; // Tokens per second

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake zero");
        stakingToken.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        lastStakedTime[msg.sender] = block.timestamp;
    }

    function withdraw() external {
        uint256 staked = balances[msg.sender];
        require(staked > 0, "No stake found");

        uint256 reward = (block.timestamp - lastStakedTime[msg.sender]) * rewardRate;
        balances[msg.sender] = 0;
        lastStakedTime[msg.sender] = 0;

        stakingToken.transfer(msg.sender, staked);
        rewardToken.transfer(msg.sender, reward);
    }
}
