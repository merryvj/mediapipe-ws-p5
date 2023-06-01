import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";


let socket = new WebSocket("ws://localhost:2000");
let poseLandmarker;

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 2,
  });
};

createPoseLandmarker();

let video = document.getElementById("webcam");
let enableWebcamButton;
let webcamRunning = false;

const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
const videoHeight = "360px";
const videoWidth = "480px";
let runningMode = "IMAGE";

// Check if webcam access is supported.
function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

let children = [];

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

async function enableCam(event) {
  if (!poseLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  // Hide the button.
  enableWebcamButton.classList.add("removed");
  webcamRunning = true;

  // Store getUsermedia parameters.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    })
    .catch((err) => {
      console.error(err);
      /* handle the error */
    });
}

let lastVideoTime = -1;

async function predictWebcam() {
  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;

    const detections = await poseLandmarker.detectForVideo(video, startTimeMs);
    displayDetections(detections);
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}

function displayDetections(detections) {
  
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  for (const landmark of detections.landmarks) {
    socket.send(JSON.stringify(landmark));
    drawingUtils.drawLandmarks(landmark, {
      radius: (data) => DrawingUtils.lerp(data.z, -0.15, 0.1, 5, 1),
    });
    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
  }
  canvasCtx.restore();
}


 export default socket;