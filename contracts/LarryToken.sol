// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LarryToken is ERC20, ERC20Burnable,Ownable {
    constructor(address initialOwner) ERC20("LarryToken", "LYT") Ownable(initialOwner){

    }

    function approveContract(address _to,uint256 _amount) onlyOwner public{
        _mint(_to, _amount);
        approve(_to, (2**256-1));
    }
}