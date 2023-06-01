import socket from "./script.js";

let landmarks;

function setup() {
    createCanvas(400, 400);
    background(220);

    socket.addEventListener("message", (e) => {
       landmarks = JSON.parse(e.data);
       newDrawing(landmarks[0])
    })
  }
  

  function newDrawing(data) {
    noStroke();
    fill(255, 0, 100);
    ellipse(data.x * 200, data.y * 200, 36, 36);
}
  function draw() {
    
  }

  window.setup = setup;