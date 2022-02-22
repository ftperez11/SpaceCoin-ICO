//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Treasury {
    uint public treasuryFunds;
    
    constructor() {}

    function collectTax() payable external {
        treasuryFunds += msg.value;
    }

}
