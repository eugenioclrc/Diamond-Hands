//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import "hardhat/console.sol";

contract DiamondHands {
  mapping (address => uint256) public balances;
  mapping (address => uint256) public unlockTime;

  event Deposit(address indexed account, uint256 amount);
  event Withdraw(address indexed account, uint256 amount);

  modifier withdrawCheck(uint256 amount) {
    require(amount > 0, "Invalid amount");
    require(balances[msg.sender] >= amount, "You dont got enough ether");
    require(block.timestamp >= unlockTime[msg.sender], "You paper hands! HODL!");
    
    _;
  }

  function deposit() public payable {
    require(msg.value > 0, "Sanchez, you cheap bastard");
    // add balance to account
    balances[msg.sender] += msg.value;
    // current block timestamp plus 2 years
    unlockTime[msg.sender] = block.timestamp + 2 * 365 * 24 * 60 * 60;
    emit Deposit(msg.sender, msg.value);
  }

  function withdrawAll() withdrawCheck(balances[msg.sender]) public {
    uint256 amount = balances[msg.sender];
    balances[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
    emit Withdraw(msg.sender, amount);
  }

  function withdraw(uint256 amount) withdrawCheck(amount) public {
    balances[msg.sender] -= amount;
    payable(msg.sender).transfer(amount);

    emit Withdraw(msg.sender, amount);
  }

  function balanceOf(address account) public view returns (uint256) {
    return balances[account];
  }

  function getunlockTime(address account) public view returns (uint256) {
    return unlockTime[account];
  }
}
