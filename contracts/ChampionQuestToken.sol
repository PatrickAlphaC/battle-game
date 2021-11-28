// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// inspired by woofy: https://etherscan.io/address/0xd0660cd418a64a1d44e9214ad8e459324d8157f1#code

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ChampionQuestToken is ERC20 {
    IERC20 public immutable s_ufoToken;

    constructor(address ufoTokenAddress) ERC20("ChampionQuestToken", "CQT") {
        s_ufoToken = IERC20(ufoTokenAddress);
    }

    function decimals() public view virtual override returns (uint8) {
        return 12;
    }

    function swapUFOForCQT(uint256 amount) public {
        s_ufoToken.transferFrom(msg.sender, address(this), amount);
        _mint(msg.sender, amount);
    }

    function swapCQTForUFO(uint256 amount) public {
        _burn(msg.sender, amount);
        s_ufoToken.transfer(msg.sender, amount);
    }
}
