# Decentralized Exchange (DEX) with Automated Market Maker (AMM)

## 🧭 Overview
A decentralized exchange platform that enables users to swap tokens using an Automated Market Maker (AMM) algorithm and participate in liquidity provision to earn trading fees.

## 🛠️ Technologies Used
| Area                  | Tech                                                   |
|-----------------------|------------------------------------------              |
| Smart Contract Development         | [Solidity](https://soliditylang.org/)     |
| Library for smart contracts         | [OpenZeppelin](https://www.openzeppelin.com/)     |
| Ethereum Deployment Environment   | [Hardhat](https://hardhat.org/)            |
| Library for interating with ethereum blockchain| [Ethers.js](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)                                                               |
| Frontend Exchange Platform        | [NextJs](https://nextjs.org/)              |

## 🔗 Links

- [Demo](https://uniswap-clone-eight-chi.vercel.app/)

To start using the demo, make sure metamask wallet is installed in your browser with the following settings:
- Add a new wallet with this private key: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
- Add a custom network with this URL: "https://province-split-sh-null.trycloudflare.com"
- Click "Connect" on my demo website and you are all set!

## 🚀 Features
<p align="center" width="100%">
    <img width="100%" src="/public/lpdiagram.png">
</p>
#### Token Swapping via AMM
- Implemented using a smart contract written in Solidity

- Uses the constant product formula (x * y = k) for price determination

- Supports ERC-20 token swaps with ETH pairs

- Calculates swap amounts and fees automatically

- Price impact displayed for each swap

- Each trade pays a small fee (e.g., 0.3%), which is added to the pool.

#### Liquidity Pool Participation
- Users can deposit funds into liquidity pools

- Withdraw liquidity at any time

- Receives LP (Liquidity Provider) tokens representing pool share

- Liquidity Providers earn a share of the transaction fees, proportional to their share of the pool.

## 📜 Core Contracts

Pool.sol - Main exchange contract handling swaps and liquidity

LarryToken.sol - ERC-20 token contract

## 🧮 Algorithms

### Swap functions
```solidity
//Call this function when user sells ETH
function depositEth() external payable{
        //Validate ETH sent is greater than 0
        require(msg.value>0);

        uint256 amountBeforeFee = msg.value*1000/1003;
        
        //Calculate k, where k = current eth balance * token balance
        uint256 k = ethBalance * ercToken.balanceOf(address(this));

        //New token balance = k / new eth balance
        uint256 newBalance = k / (amountBeforeFee + ethBalance);

        //Token amount sent to user = (Current token balance - New token balance)
        uint256 amount = (ercToken.balanceOf(address(this)) - newBalance);

        //Update eth balance
        ethBalance = address(this).balance;

        //Make sure user successfully gets paid, else revert transaction
        require(ercToken.transfer(msg.sender,amount));
}

//Call this function when user buys ETH
function withdrawEth(uint256 _tokenAmount) external{

        //Validate Token sent is greater than 0
        require(_tokenAmount>0);

        //Calculate k, where k = old token balance * eth balance
        uint256 k = ercToken.balanceOf(address(this)) * address(this).balance;

        uint256 amountBeforeFee = _tokenAmount*1000/1003;
        
        //New eth balance = k / new token balance
        uint256 newBalance = k / (ercToken.balanceOf(address(this)) + amountBeforeFee);

        //Try withdraw Token from user
        require(ercToken.transferFrom(msg.sender, address(this), _tokenAmount),"Insufficient Token Balance");

        //ETH sent to user = Current eth balance - New eth balance
        uint256 amount = address(this).balance - newBalance;

        //Update eth balance
        ethBalance = ethBalance - amount;

        //Pay ETH to user at the end to prevent reentrancy
        payable(msg.sender).transfer(amount);
}

```

### Liquidity pool functions
```solidity
//Deposit funds to LP
function depositPool() external payable{

        //Validate ETH sent is greater than 0
        require(msg.value>0);
        
        //Calculate the amount of swap tokens required based on the current ETH/TKN ratio
        uint256 tokenAmount = msg.value * ercToken.balanceOf(address(this))/ethBalance;
        
        //Make sure user has sufficient swap tokens
        require(ercToken.transferFrom(msg.sender, address(this), tokenAmount),"Insufficient Token Balance");
        
        //Calculate the amount of LP tokens minted to user
        uint256 lpMintAmount = totalSupply()*msg.value/ethBalance;
        _mint(msg.sender, lpMintAmount);
        
        //Update ETH balance
        ethBalance = address(this).balance;
}

//Withdraw funds from LP
function withdrawPool(uint _amount) external{
        
        //Validate user has sufficient LP tokens
        require(_amount<=balanceOf(msg.sender) && _amount>0);
        
        //Calculate the amount of ETH and swap tokens will be withdrawn
        uint256 tokenAmount = _amount * ercToken.balanceOf(address(this))/totalSupply();
        uint256 ethAmount = _amount * address(this).balance/totalSupply();
        
        _burn(msg.sender, _amount);
        ethBalance = address(this).balance - ethAmount;
        
        //Pay swap token to user
        require(ercToken.transfer(msg.sender,tokenAmount));
        
        //Pay ETH to user at the end to prevent reentrancy
        payable(msg.sender).transfer(ethAmount);
}
```

## Prerequisites

- Node.js (v16+ recommended)
- Hardhat or Truffle
- Ethereum development environment (Ganache, Hardhat Network, etc.)
- Web3.js or Ethers.js

## Installation

##### 1. Clone the repository:
```bash
git clone https://github.com/lylaw27/https://github.com/lylaw27/Uniswap-Clone.git.git
cd Uniswap-Clone
```

##### 2. Build the project:
```bash
npm install
```

##### 3. Configure environment variables:
```bash
NEXT_PUBLIC_ETH_TESTNET=YOUR_ETHEREUM_NODE_URL
```
## Usage

### Deploying Smart Contracts Locally
```bash
# Compile solidity smart contracts
npx hardhat compile

# Start a local ethereum node
npx hardhat node

# Deploy solidity smart contracts
npx hardhat ignition deploy ./ignition/modules/LarryToken.ts --network localhost
```

### Run the Project Locally
```bash
npm run dev
# or
yarn dev
```

## Security Features
- Reentrancy protection

- Input validation

- Safe math operations

- Fee accounting separation

- Withdrawal pattern implementation

## License
MIT License

## Contact
For questions or contributions, please open an issue or contact project maintainers.
