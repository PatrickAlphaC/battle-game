// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUFO is ERC20 {
    constructor(uint256 initial_supply) ERC20("UFO", "UFO") {
        _mint(msg.sender, initial_supply); // 5000 UFOs
    }
}
