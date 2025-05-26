import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenModule = buildModule("newToken", (m)=>{
    const token = m.contract("LarryToken",["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]);
    const newPool = m.contract("Pool",[token],{
        value: 5_000_000_000_000_000_000_000n
    });
    const mintToken = 1_000_000_000_000_000_000_000_000n;
    m.call(token,"approveContract",[newPool,mintToken]);
    return {token,newPool};
});

export default TokenModule;