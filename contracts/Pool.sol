// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Pool is ERC20{
    using Math for uint256;
    ERC20 private ercToken;
    uint256 private ethBalance;
    struct userBalances{
        uint256 ethBalance;
        uint256 tokenBalance;
    }
    constructor(ERC20 _token) payable ERC20("LpToken","LPT"){
        ercToken = _token;
        ethBalance = ethBalance + msg.value;
        _mint(address(this),500_000_000_000_000_000_000_000);
    }

    function ethDeposit() external payable{
        ethBalance = ethBalance + msg.value;
    }

    function getEthBalance() external view returns (uint256){
        return address(this).balance;
    }

    function getTokenBalance() external view returns (uint256){
        return ercToken.balanceOf(address(this));
    }

    function getPriceQuote(bool eth,uint256 _amount,bool inputSell) external view returns (uint256){
        uint256 inputBalance = address(this).balance;
        uint256 outputBalance = ercToken.balanceOf(address(this));
        uint256 quoteAmount;
        if(!eth){
            inputBalance = ercToken.balanceOf(address(this));
            outputBalance = address(this).balance;
        }
        uint256 k = inputBalance * outputBalance;
        if(inputSell){
            quoteAmount = (outputBalance - k / (inputBalance + _amount))*1000/1003;
        }
        else{
            quoteAmount = (k / (inputBalance - _amount) - outputBalance)*1003/1000;
        }
        return quoteAmount;
    }

    //Call this function when user sells ETH
    function depositEth() external payable{
        //Validate ETH sent is greater than 0
        require(msg.value>0);

        //Calculate k, where k = current eth balance * token balance
        uint256 k = ethBalance * ercToken.balanceOf(address(this));

        //New token balance = k / new eth balance
        uint256 newBalance = k / (address(this).balance);

        //Token amount sent to user = (Current token balance - New token balance) / 0.3% Tx fee
        uint256 amount = (ercToken.balanceOf(address(this)) - newBalance);
        uint256 amountAfterFee = amount*1000/1003;

        //Update eth balance
        ethBalance = address(this).balance;

        //Make sure user successfully gets paid, else revert transaction
        require(ercToken.transfer(msg.sender,amountAfterFee));
    }

    //Call this function when user buys ETH
    function withdrawEth(uint256 _tokenAmount) external{

        //Validate ETH sent is greater than 0
        require(_tokenAmount>0);

        //Calculate k, where k = old token balance * eth balance
        uint256 k = address(this).balance * ercToken.balanceOf(address(this));

        //Try withdraw Token from user
        require(ercToken.transferFrom(msg.sender, address(this), _tokenAmount),"Insufficient Token Balance");

        //New eth balance = k / new token balance
        uint256 newBalance = k / ercToken.balanceOf(address(this));

        //ETH sent to user = (Current eth balance - New eth balance)) / 0.3% Tx fee
        uint256 amount = address(this).balance - newBalance;
        uint256 amountAfterFee = amount*1000/1003;

        //Update eth balance
        ethBalance = ethBalance - amountAfterFee;

        //Pay ETH to user at the end to prevent reentrancy
        payable(msg.sender).transfer(amountAfterFee);
    }

    function getPoolQuote(bool eth,uint256 _amount) external view returns (uint256){
        uint outputAmount;
        if(eth){
            outputAmount = _amount * ercToken.balanceOf(address(this))/ethBalance;
        }
        else{
            outputAmount = _amount * ethBalance/ercToken.balanceOf(address(this));
        }
        return outputAmount;
    }

    function getWithdrawalQuote(uint256 _amount) external view returns (userBalances memory){
        userBalances memory outputAmount;
        require(_amount<=balanceOf(msg.sender));
        outputAmount.tokenBalance = _amount * ercToken.balanceOf(address(this))/totalSupply();
        outputAmount.ethBalance = _amount * address(this).balance/totalSupply();
        return outputAmount;
    }

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
}
