import {useState} from "react";
import {ethers, AbstractProvider,BrowserProvider, Signer} from "ethers";
import tokenAbi from '../artifacts/contracts/LarryToken.sol/LarryToken.json';
import poolAbi from '../artifacts/contracts/Pool.sol/Pool.json';
import roundingFunc from "../components/RoundingFunc";

const useSwapEthereum = () => {
    const [address, setAddress] = useState<string>("");
    const [ethBalance, setEthBalance] = useState<string>("0.00");
    const [tokenBalance, setTokenBalance] = useState<string>("0.00");
    const [poolEthBal,setPoolEthBal] = useState<string>("0.00");
    const [poolTokenBal,setPoolTokenBal] = useState<string>("0.00");
    const [sellAmount,setSellAmount] = useState<string>("");
    const [buyAmount,setBuyAmount] = useState<string>("");
    const [provider, setProvider] = useState<BrowserProvider | AbstractProvider>();
    const [signer,setSigner] = useState<Signer | null>();
    const [swapState,setSwapState] = useState<boolean>(true);
    const [sellSelected,setSellSelected] = useState<boolean>(true);
    const [blockCount,setBlockCount] = useState<number>();
    const [swapStatus,setSwapStatus] = useState<string>("Enter Amount");

    const tokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
    const poolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const tokenContract = new ethers.Contract(tokenAddress,tokenAbi.abi,signer);
    const poolContract = new ethers.Contract(poolAddress,poolAbi.abi,signer);

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
        }
        if(sellSelected){
            await getQuote(sellSelected,swapState,sellAmount);
        }
        else{
            await getQuote(sellSelected,!swapState,buyAmount);
        }
    }

    const getQuote = async(sell:boolean,eth:boolean,val:string) =>{
        if(val == ""){
            setSellAmount("");
            setBuyAmount("");
            setSwapStatus("Enter Amount");
            return;
        }
        if(!sell && (eth && parseFloat(val)>=parseFloat(poolEthBal)  || !eth && parseFloat(val)>=parseFloat(poolTokenBal))){
            setSwapStatus("Exceeded Pool Limit");
            return;
        }
        await poolContract.getPriceQuote(eth,ethers.parseEther(val),sell)
            .then((res)=>{
                const quoteAmount = roundingFunc(res);
                if(sell){
                    setBuyAmount(quoteAmount);
                    if(eth && parseFloat(val)>=parseFloat(ethBalance) || !eth && parseFloat(val)>=parseFloat(tokenBalance)){
                        setSwapStatus("Insufficient Funds");
                    }
                    else{
                        setSwapStatus("Swap");
                    }
                }
                else{
                    setSellAmount(quoteAmount);
                    if(!eth && parseFloat(quoteAmount)>=parseFloat(ethBalance) || eth && parseFloat(quoteAmount)>=parseFloat(tokenBalance)){
                        setSwapStatus("Insufficient Funds");
                    }
                    else{
                        setSwapStatus("Swap");
                    }
                }
            });

    }
    const initiateSwap = (e,sellEth:boolean) =>{
        if(sellEth){
            poolContract.depositEth({value: ethers.parseEther(sellAmount)});
        }
        else{
            poolContract.withdrawEth(ethers.parseEther(sellAmount));
        }
    }

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

    const amountChange = async(e) =>{
        const val = e.target.value;
        if(sellSelected){
            setSellAmount(val);
            await getQuote(sellSelected,swapState,val);
        }
        else{
            setBuyAmount(val);
            await getQuote(sellSelected,!swapState,val);
        }
    }

    const swapBuySell = () =>{
        setSellSelected(!sellSelected);
        const temp = sellAmount;
        setSellAmount(buyAmount);
        setBuyAmount(temp);
        setSwapState(!swapState);
    }

    return {
        swapStatus,refreshData,blockCount,swapBuySell,amountChange,swapState,setSwapState,initiateSwap,connect,getBlockData,tokenBalance,getQuote,ethBalance,buyAmount,setSellAmount,address,sellAmount,setBuyAmount,poolEthBal,poolTokenBal,sellSelected,setSellSelected
    };
};

export default useSwapEthereum;