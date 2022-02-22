//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Treasury.sol";

contract Spacecoin is ERC20 {
    Treasury public treasury;
    bool public taxActive;
    address public owner;

    
    modifier onlyOwner(){
        require(owner == msg.sender, "Only owner");
        _;
    }
    constructor() ERC20("Spacecoin", "SPC") {
        owner = msg.sender;
        _mint(msg.sender, 500000 * (10 ** decimals()));
        taxActive = false;
        treasury = new Treasury();
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        if(taxActive){
            uint taxAmount = (amount * 2)/100;
            uint afterTax = amount - taxAmount;
            _transfer(owner, recipient, afterTax);
            _transfer(owner, address(treasury), taxAmount);
        } else {
            _transfer(owner, recipient, amount);
        }
        return true;
    }

    function updateTaxStatus() external onlyOwner {
        taxActive = !taxActive;
    }





}