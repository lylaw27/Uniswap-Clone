import {ethers} from "ethers";

const roundingFunc = (wei: number | bigint) =>{
    const weiStr = ethers.formatEther(wei);
    const eth = parseFloat(weiStr);
    let afterDec = false;
    let strBuilder="";
    if(eth>=1){
        let i= 0;
        let sigFig = 0;
        while(i<weiStr.length && (!afterDec || sigFig<6)){
            if(weiStr.charAt(i) != '.'){
                sigFig++;
            }
            else{
                afterDec = true;
            }
            strBuilder = strBuilder + weiStr.charAt(i);
            i++;
        }
        if(strBuilder.charAt(i-1) == '.'){
            strBuilder = strBuilder.slice(0,i-1);
        }
    }
    else{
        let i= 0;
        let sigFigStart = false;
        let sigFig = 0;
        while(i<weiStr.length && sigFig<6 && strBuilder.length<10){
            if(i>1 && weiStr.charAt(i) != "0"){
                sigFigStart = true;
            }
            if(sigFigStart){
                sigFig++;
            }
            strBuilder = strBuilder + weiStr.charAt(i);
            i++;
        }
        while(i>3 && strBuilder.charAt(i-1)=='0'){
            strBuilder = strBuilder.slice(0,i-1);
            i--;
        }
    }
    return strBuilder;
}

export default roundingFunc;