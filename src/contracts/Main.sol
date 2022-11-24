// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "hardhat/console.sol";

contract Main {
  mapping(address => uint256) userBalances;

  event ReceiveEther(uint256 amount);

  constructor() {}

  receive() external payable {
    emit ReceiveEther(msg.value);
  }

  function createToken() external {
    userBalances[msg.sender] += 1;
  }

  function getUserBalance() external view returns (uint256) {
    return userBalances[msg.sender];
  }

  function withdraw() external {
    uint userBalance = userBalances[msg.sender];
    require(userBalance > 0, "InadequateBalance");
    payable(address(msg.sender)).transfer(userBalance);
    userBalances[msg.sender] = 0;
    console.log(msg.sender, "withdraw");
  }

  function greeting() public pure returns (string memory) {
    return "hello world";
  }
}
