
const WebSocket = require('ws'); 
let socket;

let data = {};

function newDrawing(data) {
    noStroke();
    fill(255, 0, 100);
    ellipse(data.x, data.y, 36, 36);
}

function mouseDragged() {
    if (socket) {
        noStroke();
        fill(255);
        ellipse(mouseX, mouseY, 36, 36);

        data = {
            x: mouseX,
            y: mouseY
        }
    
        socket.send(JSON.stringify(data));
    }

    return false;
}


function setup() {
    createCanvas(400, 400);
    background(220);
    socket = new WebSocket("ws://localhost:2000");

    socket.addEventListener("message", (e) => {
        data = JSON.parse(e.data);
        newDrawing(data);
    })
  }
  
  function draw() {
  }