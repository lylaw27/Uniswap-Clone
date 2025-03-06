import {ethers} from "ethers";


export default function AssetInfo ({user,ethBalance,tokenBalance}:{user:boolean,ethBalance: bigint,tokenBalance: bigint}){

    return(
    <div className="flex justify-between mb-16">
        <div className="p-8 bg-teal-400 rounded-xl text-2xl">
            <div>
                {user ? "My ": "Pool "}
                ETH Balance: {ethBalance} ETH
            </div>
            <div className="p-3"/>
            <div>
                {user ? "My ": "Pool "}
                Token Balance: {tokenBalance} LYT
            </div>
        </div>
        <div className="px-5"/>
    </div>
    )

}
