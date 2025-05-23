import Link from "next/link";
import GithubIcon from "./githubicon";

export default function Navigation({connect, address}:{connect:()=>Promise<string|undefined>, address:string | undefined}) {
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link href="/">ExchangeGG</Link>
                </div>
                <div className="flex space-x-6 align-middle items-center">
                    {
                        address ? 
                        <Link href={`/portfolio/${address}`}>My Portfolio</Link>:
                        <div className="hover:cursor-pointer" onClick={()=>{alert("Connect to Web3 Wallet First!")}}>My Portfolio</div>
                    }
                    <Link href="https://github.com/lylaw27/Crypto-Exchange-Java">
                        <GithubIcon/>
                    </Link>
                    {address ? <div>{address}</div> : <button onClick={connect} className="p-3 bg-blue-500 font-bold rounded-lg text-white">Connect</button>}
                </div>
            </div>
        </div>
    )
}
