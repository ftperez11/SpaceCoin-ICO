const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("ethers");

use(solidity);

describe("ICO Contract", function(){
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let ICO;
    let spacecoinContractAddress;
    let spacecoinContract;

    beforeEach(async () => {
        [owner, addr1, addr2, addr3, ICO] = await ethers.getSigners();
        const ICO_Contract = await ethers.getContractFactory("SpacecoinICO");
        ICO = await ICO_Contract.deploy();
 
        await ICO.deployed();
        spacecoinContractAddress = await ICO.spacecoin()
        spacecoinContract = await ethers.getContractAt("Spacecoin", spacecoinContractAddress);


        treasuryContractAddress = await spacecoinContract.treasury()
        treasuryContract = await ethers.getContractAt("Treasury", treasuryContractAddress);

    })

    describe('Should deploy spacecoin', () => {
        it("Should deploy and confirm the owner of spacecoin", async () => {
            expect(await spacecoinContract.owner()).to.equal(ICO.address);
        });
        it("Should mint all tokens to ICO contract", async () => {
            let ICO_Balance = await spacecoinContract.balanceOf(ICO.address)
            expect(await spacecoinContract.totalSupply()).to.equal(ICO_Balance);
        });
    })
    describe('Should allow owner to select next phase', () => {
        it("Should move the phase by 1", async () => {
            let currentPhase = await ICO.status();
            let tx = await ICO.connect(owner).movePhase();
            tx.wait()
            expect(await ICO.status()).to.equal(currentPhase + 1);
        });
    })

    describe('Should allow owner to pause contributions', () => {
        it("Should pause the contributions and prevent new contributions", async () => {
            let amount = ethers.utils.parseEther('10')
            let tx  = await ICO.whiteListAddress(addr1.address);
            tx.wait();

            let tx_2 = await ICO.togglePauseContributions();
            tx_2.wait()
            
            await expect(
                ICO.connect(addr1).contribute({ value: amount })
            ).to.be.revertedWith("Project not active");

        });
        it("Should pause the contributions, then resume, and allow new contributions", async () => {
            let amount = ethers.utils.parseEther('10')
            let tx  = await ICO.whiteListAddress(addr1.address);
            tx.wait();

            let tx_2 = await ICO.togglePauseContributions();
            tx_2.wait()

            let tx_3 = await ICO.togglePauseContributions();
            tx_3.wait()

            let tx_4 = await ICO.connect(addr1).contribute({ value: amount })
            tx_4.wait()

            await expect(tx_4)
            .to.emit(ICO, 'NewDeposit')
            .withArgs(addr1.address, amount);
        });
    })

    describe('Test Contributions', () => {
        it("Not allow non whitelisted contribution", async () => {
            let amount = ethers.utils.parseEther('10')
            await expect(
                ICO.contribute({ value: amount })
            ).to.be.revertedWith("Must be whitelisted");
        });
        it("Should allow whitelisted contribution", async () => {
            let amount = ethers.utils.parseEther('10')
 
            let tx  = await ICO.whiteListAddress(addr1.address);
            tx.wait();

            let tx_2 = await ICO.connect(addr1).contribute({ value: amount })
            tx_2.wait()

            await expect(tx_2)
            .to.emit(ICO, 'NewDeposit')
            .withArgs(addr1.address, amount);

        });
        it("Should issue coins during open phase", async () => {
            let amount = ethers.utils.parseEther('3')
 
            let tx  = await ICO.whiteListAddress(addr1.address);
            tx.wait();

            await ICO.movePhase();
            await ICO.movePhase();

            let tx_2 = await ICO.connect(addr1).contribute({ value: amount });
            tx_2.wait()
 
            let newCoins = await spacecoinContract.balanceOf(addr1.address)

            await expect(tx_2)
            .to.emit(ICO, 'SpacecoinSent')
            .withArgs(addr1.address, newCoins);
        });
    })
    describe('Taxes', () => {
        it("Taxes should be paid to treasury", async () => {
            let amount = ethers.utils.parseEther('3')
            let amount2 = ethers.utils.parseEther('3') * 5
            let taxAmount = (amount2 * 2)/100;
            let afterTax = amount2 - taxAmount;
            await ICO.connect(owner).movePhase();
            await ICO.connect(owner).movePhase();
            
    
            await ICO.connect(owner).toggleActive();

            let tx_2 = await ICO.connect(addr1).contribute({ value: amount });
            tx_2.wait()
 
            let newCoins = await spacecoinContract.balanceOf(addr1.address)
            let treasuryFunds = await spacecoinContract.balanceOf(treasuryContractAddress)

            expect(newCoins.toString()).to.equal(afterTax.toString());
            expect(treasuryFunds.toString()).to.be.eq(taxAmount.toString());
        });
    })
})  ; 