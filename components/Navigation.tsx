import Link from "next/link";
import GithubIcon from "./githubicon";
import {usePathname} from "next/navigation";

export default function Navigation({connect, address}:{connect:()=>Promise<string|undefined>, address:string | undefined}) {
    const pathname = usePathname();
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link href="/">ExchangeGG</Link>
                </div>
                <div className="flex space-x-6 align-middle items-center">
                    {
                        pathname === '/' ?
                    <Link href={`/liquiditypool`}>
                        <button
                            className="bg-white text-xl text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                            Add Liquidity
                        </button>
                    </Link>:
                    <Link href={`/`}>
                        <button
                            className="bg-white text-xl text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                            Swap ETH
                        </button>
                    </Link>
                    }

                    <Link href="https://github.com/lylaw27/Uniswap-Clone">
                        <GithubIcon/>
                    </Link>
                    {address ? <div>{address}</div> : <button onClick={connect} className="p-3 bg-blue-500 font-bold rounded-lg text-white">Connect</button>}
                </div>
            </div>
        </div>
    )
}
