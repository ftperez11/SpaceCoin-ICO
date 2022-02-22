//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import './Treasury.sol';
import "./Spacecoin.sol";

contract SpacecoinICO {
    address public owner;
    Spacecoin public spacecoin;
    mapping(address => uint) public investorBalance;
    mapping(address => bool) whitelisted;
    bool public isPaused;
    uint constant EXCHANGE_RATE = 5;
    uint constant ICO_LIMIT = 30000 ether;
    uint public totalFunds;
    uint public seedFunds;

    enum Status {
        SEED,
        GENERAL,
        OPEN
    }
    Status public status = Status.SEED;
    
    modifier onlyOwner(){
        require(owner == msg.sender, "Only owner");
        _;
    }

    modifier active(){
        require(!isPaused, "Project not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        spacecoin = new Spacecoin();
        isPaused = false;
    }

    function getBalance(address _address) public view returns (uint){
        return investorBalance[_address];
    }
    function getTokenBalance() public view returns (uint256) {        
        return ((investorBalance[msg.sender] / (1 * 10 ^ 18)) / EXCHANGE_RATE); 
    }

    function contribute() active public payable {

        require(totalFunds + msg.value <= ICO_LIMIT, "ICO has raised enough funds");
        if(status == Status.SEED){
            require(whitelisted[msg.sender], "Must be whitelisted");
            require(totalFunds + msg.value <= 15000 ether, "Maximum funds reached for seed phase");
            require(investorBalance[msg.sender] + msg.value <= 1500 ether, "Maximum contribution reached");

            totalFunds += msg.value;
            investorBalance[msg.sender] += msg.value;


            emit NewDeposit(msg.sender, msg.value);
        } else if (status == Status.GENERAL){
            require(investorBalance[msg.sender] + msg.value <= 1000 ether, "Maximum contribution reached");
            totalFunds += msg.value;
            investorBalance[msg.sender] += msg.value;


            emit NewDeposit(msg.sender, msg.value);
        } else {
            totalFunds += msg.value;
            investorBalance[msg.sender] += msg.value;
            redeemSpacecoin();

            emit NewDeposit(msg.sender, msg.value);
        }
    }


    function movePhase() external onlyOwner  {
        if(status == Status.SEED){
            status = Status.GENERAL;
        } else if (status == Status.GENERAL){
            status = Status.OPEN;
        }
    }

    function whiteListAddress(address _address) onlyOwner external {
        whitelisted[_address] = true;
    }

    function togglePauseContributions() onlyOwner external {
        if(isPaused){
            isPaused = false;
        } else {
            isPaused = true;
        }
    }

    function redeemSpacecoin() public {
        require(status == Status.OPEN, "Must be in open phase");
        require(investorBalance[msg.sender] > 0, "No Balance");
        uint256 coins = investorBalance[msg.sender] * EXCHANGE_RATE;
        investorBalance[msg.sender] = 0;
        spacecoin.transfer(msg.sender, coins);

        emit SpacecoinSent(msg.sender, coins);
    }

    function toggleActive() external onlyOwner {
		spacecoin.updateTaxStatus();
	}



    event SpacecoinSent(address to, uint256 amount);
    event NewDeposit(address from, uint256 amount);


}