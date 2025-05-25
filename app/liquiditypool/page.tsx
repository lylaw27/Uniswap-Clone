'use client'
import {useEffect, useState} from "react";
import Navigation from "../../components/Navigation";
import usePoolEthereum from "../../hooks/usePoolEthereum";
import AssetInfo from "../../components/AssetInfo";

export default function LiquidityPool() {
    const {setBuyAmount,setSellAmount,depositLiquidity,priceChange,swapStatus,refreshData,blockCount,connect,getBlockData,tokenBalance,ethBalance,poolTokenBal,poolEthBal,
        LpBal,withdrawLiquidity,setPercentage,percentage,percentChange,buyAmount,address,sellAmount,sellSelected,setSellSelected} = usePoolEthereum();

    const [deposit,setDeposit] = useState<boolean>(true);

    useEffect(() => {
        connect().then(()=>getBlockData);
        refreshData();
    }, [address]);

    useEffect(() => {
        refreshData();
    }, [blockCount]);

    return (
        <div className="container mx-auto tex-2xl">
            <Navigation connect={connect} address={address}/>
            <div className="flex">
                <div className="w-2/3 px-16">
                    <div className="flex">
                        <button type="button" onClick={()=>{setDeposit(true);setBuyAmount("");setSellAmount("")}} className={`${deposit ? "" : "opacity-50"} text-center p-3 bg-teal-400 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:bg-teal-100 disabled:border-gray-400`}>
                            Deposit Funds
                        </button>
                        <button type="button" onClick={()=>{setDeposit(false);setBuyAmount("");setSellAmount("");setPercentage("")}} className={`${!deposit ? "" : "opacity-50"} text-center p-3 bg-teal-400 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:bg-teal-100 disabled:border-gray-400`}>
                            Withdraw Funds
                        </button>
                    </div>
                {deposit ?
                    <>
                    <div className={`p-12 ${sellSelected ? "bg-teal-300" : "bg-teal-100"} rounded-xl m-auto border-black border-2`}>
                        <div className="flex justify-between text-3xl">
                            <input className="w-3/4 bg-transparent" type="number" placeholder="0" value={sellAmount} onChange={priceChange} onSelect={()=>setSellSelected(true)}></input>
                            <div>ETH</div>
                        </div>
                    </div>
                    <div className="py-5">
                    </div>
                    <div className={`p-12 ${!sellSelected ? "bg-teal-300" : "bg-teal-100"} rounded-xl m-auto border-black border-2`}>
                        <div className="flex justify-between text-3xl">
                            <input className="w-3/4 bg-transparent" type="number" placeholder="0" value={buyAmount} onChange={priceChange} onSelect={()=>setSellSelected(false)}></input>
                            <div>LYT</div>
                        </div>
                    </div>
                    <button disabled={swapStatus != "Deposit to Pool"} type="button" onClick={depositLiquidity} className="w-full text-center p-3 bg-teal-400 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:bg-teal-100 disabled:border-gray-400">
                        {swapStatus}
                    </button>
                    </>
                :
                    <>
                        <div
                            className={`p-12 ${sellSelected ? "bg-teal-300" : "bg-teal-100"} rounded-xl m-auto border-black border-2`}>
                            <div className="text-xl flex justify-between">
                                <div>Withdraw Amount</div>
                                <div>Liquidity Pool Tokens: {LpBal}</div>
                            </div>
                            <div className="py-3"/>
                            <div contentEditable={true}
                                 className={`${percentage === "" ? "before:content-['0'] text-[#9ca3af]" : ""} after:content-['%'] single-line text-5xl text-center py-2`}
                                 onInput={percentChange}></div>
                            <hr className="h-0.5 mx-auto border-0 rounded-sm my-10 bg-[#9ca3af]"/>
                            <div className="text-xl">
                                You get:
                            </div>
                            <div className="flex justify-end text-3xl">
                                <div className="text-left px-5">
                                    {sellAmount ? sellAmount:"0.0"}
                                </div>
                                <div>ETH</div>
                            </div>
                            <div className="py-5"/>
                            <div className="flex justify-end text-3xl">
                                <div className="text-left px-5">
                                    {buyAmount ? buyAmount:"0.0"}
                                </div>
                                <div>LYT</div>
                            </div>
                        </div>
                        <button disabled={swapStatus != "Withdraw from Pool"} type="button" onClick={withdrawLiquidity} className="w-full text-center p-3 bg-teal-400 rounded-xl m-auto border-black border-2 my-5 hover:cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:bg-teal-100 disabled:border-gray-400">
                        {swapStatus}
                    </button>
                    </>
                }
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


