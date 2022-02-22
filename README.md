# SpaceCoin Initial Coin Offering
## Project Description
This project aims to raise 30,000 Ether by performing an Initial Coin Offering in 3 phases:
 - **Seed:** Only available to whitelisted private investors. Includes a maximum total private contribution limit of 15,000 Ether and an individual contribution limit of 1,500 Ether.
 - **General:** Available to the general public. Includes a total contribution limit of 30,000 Ether, inclusive of funds raised from private phase. Individual contribution limit is 1,000 Ether. 
 - **Open:** No individual contribution limit. The goal is to raise 30,000 ether at this point
## Specifications:
 - SpaceCoin token has a max supply of 500,000
 - There is a 2% treasury tax, paid to the treasury contract upon token transfers
 - The contract owner can toggle the transfer tax active/inactive
## Contracts

* `Spacecoin.sol` contains the ERC-20 implementation for Space Coin
* `SpacecoinICO.sol` contains the logic for the Initial Coin Offering
* `Treasury.sol` contains a simple contract to recieve Ether

## Installing-Dependencies

### Navigate to the root directory and run the following in your terminal:
> 
> _Install dependencies_

    npm install 

> Deploy the contracts to Rinkeby

    npx hardhat run scripts/deploy.js

> Navigate to front end folder & install dependencies

    cd frontend
    npm install

> Launch the front end locally

    npm start 

Head to `http://localhost:1234` in your browser
