import {useState} from "react";
import {ethers, AbstractProvider,BrowserProvider, Signer} from "ethers";
import tokenAbi from '../artifacts/contracts/LarryToken.sol/LarryToken.json';
import poolAbi from '../artifacts/contracts/Pool.sol/Pool.json';
import roundingFunc from "../components/RoundingFunc";

declare let window: any;

const usePoolEthereum = () => {
    const [address, setAddress] = useState<string>("");
    const [ethBalance, setEthBalance] = useState<string>("0.00");
    const [tokenBalance, setTokenBalance] = useState<string>("0.00");
    const [poolEthBal,setPoolEthBal] = useState<string>("0.00");
    const [poolTokenBal,setPoolTokenBal] = useState<string>("0.00");
    const [LpBal,setLpBal] = useState<string>("0.00");
    const [sellAmount,setSellAmount] = useState<string>("");
    const [buyAmount,setBuyAmount] = useState<string>("");
    const [provider, setProvider] = useState<BrowserProvider | AbstractProvider>();
    const [signer,setSigner] = useState<Signer | null>();
    const [sellSelected,setSellSelected] = useState<boolean>(true);
    const [blockCount,setBlockCount] = useState<number>();
    const [percentage,setPercentage] = useState<string>("");
    const [swapStatus,setSwapStatus] = useState<string>("Enter Amount");

    const tokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    const poolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const tokenContract = new ethers.Contract(tokenAddress,tokenAbi.abi,signer);
    const poolContract = new ethers.Contract(poolAddress,poolAbi.abi,signer);

 
    
    const connect = async() => {
        if (window.ethereum) {
            const provider = new ethers.WebSocketProvider("ws://127.0.0.1:8545");
            setProvider(provider);
            const newSigner = await provider.getSigner();
            setSigner(newSigner);
            await provider.on('block',getBlockData);
            console.log("Wallet Connected!");
            const address = await newSigner.getAddress();
            setAddress(address);
            return address;
        }
        else {
            console.log("Metamask not installed; using read-only defaults");
            const provider = ethers.getDefaultProvider();
            setProvider(provider);
        }
    }

    const getBlockData = async(blockNumber:number) => {
        setBlockCount(blockNumber);
    }

    const refreshData = async() =>{
        if(provider){
            provider.getBalance(address)
                .then((res)=>{
                    setEthBalance(roundingFunc(res));
                });
            provider.getBalance(poolAddress)
                .then((res)=>{
                    setPoolEthBal(roundingFunc(res));
                });
            setTokenBalance(roundingFunc(await tokenContract.balanceOf(address)));
            setPoolTokenBal(roundingFunc(await tokenContract.balanceOf(poolAddress)));
            setLpBal(roundingFunc(await poolContract.balanceOf(address)));
        }
        if(sellSelected){
            await getLiquidityPrice(sellSelected,sellAmount);
        }
        else{
            await getLiquidityPrice(sellSelected,buyAmount);
        }
    }

    const getLiquidityPrice = async(eth:boolean,val:string)=>{
        if(val == ""){
            setSellAmount("");
            setBuyAmount("");
            setSwapStatus("Enter Amount");
            return;
        }
        await poolContract.getPoolQuote(eth,ethers.parseEther(val)).then((res)=>{
            const quoteAmount = roundingFunc(res);
            if(eth){
                setBuyAmount(quoteAmount);
                if(parseFloat(val)>=parseFloat(ethBalance) || parseFloat(quoteAmount)>=parseFloat(tokenBalance)){
                    setSwapStatus("Insufficient Funds");
                }
                else{
                    setSwapStatus("Deposit to Pool");
                }
            }
            else{
                setSellAmount(quoteAmount);
                if(parseFloat(quoteAmount)>=parseFloat(ethBalance) || parseFloat(val)>=parseFloat(tokenBalance)){
                    setSwapStatus("Insufficient Funds");
                }
                else{
                    setSwapStatus("Deposit to Pool");
                }
            }
        });
    };

    const depositLiquidity = ()=>{
        poolContract.depositPool({value: ethers.parseEther(sellAmount)});
    }

    const priceChange = async(e:React.ChangeEvent<HTMLInputElement>) =>{
        const val = e.target.value;
        if(sellSelected){
            setSellAmount(val);
            await getLiquidityPrice(sellSelected,val);
        }
        else{
            setBuyAmount(val);
            await getLiquidityPrice(sellSelected,val);
        }
    }

    const percentChange = async(e:React.ChangeEvent<HTMLInputElement>)=>{
        const val = e.target.textContent;
        const regex = /^\d*\.?\d*$/;
        if(val == null){
            return;
        }
        let number = parseFloat(val);
        if(val === ""){
            number = 0;
        }
        if(val.match(regex) && number>=0 && number<=100 && val.length<6){
            setPercentage(val);
            await withdrawQuote(number);
        }
        else{
            e.target.textContent = percentage;
        }
        if(number === 0){
            setSwapStatus("Enter Amount");
        }
        else{
            setSwapStatus("Withdraw from Pool");
        }
    }

    const withdrawQuote = async(percent:number)=>{
        await poolContract.balanceOf(address).then((res)=>{
            const lpTokenAmount = res*BigInt(percent*10000)/BigInt(1000000);
            poolContract.getWithdrawalQuote(lpTokenAmount).then((res)=>{
                setSellAmount(roundingFunc(res[0]));
                setBuyAmount(roundingFunc(res[1]));
            });
        });
    }

    const withdrawLiquidity = async() =>{
        const percent = parseFloat(percentage);
        await poolContract.balanceOf(address).then((res)=>{
            const lpTokenAmount = res*BigInt(percent*10000)/BigInt(1000000);
            poolContract.withdrawPool(lpTokenAmount);
        });
    }

    return {
        LpBal,withdrawLiquidity,setPercentage,setBuyAmount,setSellAmount,percentage,percentChange,depositLiquidity,priceChange,getLiquidityPrice,
        swapStatus,refreshData,blockCount,connect,getBlockData,tokenBalance,ethBalance,buyAmount,address,sellAmount,poolEthBal,poolTokenBal,sellSelected,setSellSelected
    };
};

export default usePoolEthereum;
