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
    constructor(ERC20 _token,uint256 _mintAmount) payable ERC20("LpToken","LPT"){
        ercToken = _token;
        ethBalance = ethBalance + msg.value;
        uint256 supply = Math.sqrt(ethBalance*_mintAmount);
        _mint(address(this),supply);
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

    function depositEth() external payable{
        require(msg.value>0);
        uint256 k = ethBalance * ercToken.balanceOf(address(this));
        uint256 newBalance = k / (address(this).balance);
        uint256 amount = (ercToken.balanceOf(address(this)) - newBalance);
        uint256 amountAfterFee = amount*1000/1003;
        ethBalance = address(this).balance;
        require(ercToken.transfer(msg.sender,amountAfterFee));
    }

    function withdrawEth(uint256 _tokenAmount) external{
        require(_tokenAmount>0);
        uint256 k = address(this).balance * ercToken.balanceOf(address(this));
        require(ercToken.transferFrom(msg.sender, address(this), _tokenAmount));
        uint256 newBalance = k / ercToken.balanceOf(address(this));
        uint256 amount = address(this).balance - newBalance;
        uint256 amountAfterFee = amount*1000/1003;
        ethBalance = ethBalance - amountAfterFee;
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

    function depositPool() external payable{
        require(msg.value>0);
        uint256 tokenAmount = msg.value * ercToken.balanceOf(address(this))/ethBalance;
        require(ercToken.transferFrom(msg.sender, address(this), tokenAmount),"Insufficient Token Balance");
        uint256 lpMintAmount = Math.sqrt(msg.value * tokenAmount);
        _mint(msg.sender, lpMintAmount);
        ethBalance = address(this).balance;
    }

    function withdrawPool(uint _amount) external{
        require(_amount<=balanceOf(msg.sender) && _amount>0);
        uint256 tokenAmount = _amount * ercToken.balanceOf(address(this))/totalSupply();
        uint256 ethAmount = _amount * address(this).balance/totalSupply();
        require(ercToken.transfer(msg.sender,tokenAmount));
        _burn(msg.sender, _amount);
        ethBalance = address(this).balance - ethAmount;
        payable(msg.sender).transfer(ethAmount);
    }
}
