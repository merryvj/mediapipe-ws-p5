const WebSocket = require("ws");

const wss = new WebSocket.Server({port: 2000});

wss.on("connection", ws => {
    console.log("New client connected!");

    ws.on("message", message => {
        //console.log(`Client has sent us: ${message}`);
        ws.send(message.toString());
    })

    ws.on("close", () => {
        console.log("Client has disconnected!");
    })
});