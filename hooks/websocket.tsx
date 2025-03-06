import {Client} from '@stomp/stompjs'


const startWebSocket = (add,setUserInfo,setAsks,setBuys,setTrades) =>{

    const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        onConnect: ()=>{
            // client.publish({destination:'/app/getUser',body:userId)
            if(setAsks){
                client.subscribe('/orderbook/asks', message =>{
                    setAsks(JSON.parse(message.body));
                })
            }
            if(setBuys) {
                client.subscribe('/orderbook/bids', message => {
                    setBuys(JSON.parse(message.body));
                })
            }
            client.subscribe('/orderbook/trades', message =>{
                setTrades(JSON.parse(message.body));
            })
            client.subscribe("/orderbook/user", message =>{
                setUserInfo(JSON.parse(message.body));
            })
            client.publish({destination: "/app/getuser", body:add});
        },
    });
    console.log("connected!");
    client.activate();
    console.log(add);
    return client;
}

export default startWebSocket ;
