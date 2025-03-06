'use client'
import {useEffect} from "react";
import Navigation from "../components/Navigation";
import useSwapEthereum from "../hooks/useSwapEthereum";
import AssetInfo from "../components/AssetInfo";
import SwapVertical from "../components/SwapVertical";


export default function Home() {
    const {swapStatus,refreshData,blockCount,amountChange,swapBuySell,initiateSwap,connect,getBlockData,tokenBalance,ethBalance,poolTokenBal,poolEthBal,
        buyAmount,address,sellAmount,sellSelected,setSellSelected,swapState} = useSwapEthereum();


    useEffect(() => {
        connect().then(getBlockData);
    }, [address]);

    useEffect(() => {
        refreshData();
    }, [blockCount,swapState]);


    return (
      <div className="container mx-auto tex-2xl">
        <Navigation connect={connect} address={address}/>
          <div className="flex">
              <div className="w-2/3 px-16">
                  <div className={`p-12 ${sellSelected ? "bg-teal-300" : "bg-teal-100"} rounded-xl m-auto border-black border-2`}>
                      <div className="text-xl">
                          Sell
                      </div>
                      <div className="flex justify-between text-3xl">
                          <input className="w-3/4 bg-transparent" type="number" placeholder="0" value={sellAmount} onChange={amountChange} onSelect={()=>setSellSelected(true)}></input>
                          <div>{swapState ? "ETH" : "LYT"}</div>
                      </div>
                  </div>
                  <div className="flex justify-center">
                      <div onClick={swapBuySell} className="p-3 bg-teal-100 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer">
                          <SwapVertical/>
                      </div>
                  </div>
                      <div className={`p-12 ${!sellSelected ? "bg-teal-300" : "bg-teal-100"} rounded-xl m-auto border-black border-2`}>
                          <div className="text-xl">
                              Buy
                          </div>
                          <div className="flex justify-between text-3xl">
                              <input className="w-3/4 bg-transparent" type="number" placeholder="0" value={buyAmount} onChange={amountChange} onSelect={()=>setSellSelected(false)}></input>
                              <div>{!swapState ? "ETH" : "LYT"}</div>
                          </div>
                      </div>
                      <button disabled={swapStatus != "Swap"} type="button" onClick={(e)=>initiateSwap(e,swapState)} className="w-full text-center p-3 bg-teal-400 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:bg-teal-100 disabled:border-gray-400">
                          {swapStatus}
                      </button>
              </div>
              <div className="w-1/3">
                  <div>
                      {ethBalance == null ? <></> : <AssetInfo user={true} ethBalance={ethBalance} tokenBalance={tokenBalance}/>}
                  </div>
                  <div>
                      {poolEthBal == null ? <></> : <AssetInfo user={false} ethBalance={poolEthBal} tokenBalance={poolTokenBal}/>}
                  </div>
              </div>
          </div>
      </div>
  );
}

