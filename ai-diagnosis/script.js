// Path to your local model folder
const MODEL_PATH = "./model/";
const modelURL = MODEL_PATH + "model.json";
const metadataURL = MODEL_PATH + "metadata.json";

let model, webcam, maxPredictions;

// DOM elements
const labelElement = document.getElementById("label");
const responseElement = document.getElementById("response");
const cameraContainer = document.getElementById("camera-container");

// Load model + start webcam automatically
async function init() {
  labelElement.innerText = "Loading model...";

  // Load the Teachable Machine image model
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Setup webcam
  const flip = true; // mirror for front camera
  webcam = new tmImage.Webcam(400, 300, flip);
  await webcam.setup();
  await webcam.play();

  // Add webcam feed to right side box
  cameraContainer.innerHTML = ""; // clear placeholder
  cameraContainer.appendChild(webcam.canvas);

  labelElement.innerText = "Analyzing...";

  window.requestAnimationFrame(loop);
}

// Webcam loop
async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

// Predict the label from webcam image
async function predict() {
  const prediction = await model.predict(webcam.canvas);

  // Get highest probability class
  let best = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > best.probability) {
      best = prediction[i];
    }
  }

  const label = best.className;
  labelElement.innerText = label;

  // Generate diagnosis text
  responseElement.innerText = getDiagnosis(label);
}

// Neutral placeholder diagnosis text
function getDiagnosis(label) {
  switch (label) {
    case "Falling accident":
      return "Detected: Falling accident. (Add your final dramatic medical text here.)";
    case "Eye punch":
      return "Detected: Eye trauma. (Add your detailed advice here.)";
    case "Healty face":
      return "No injuries detected. (Add your narrative here.)";
    case "Dermatitis":
      return "Possible dermatitis detected. (Add explanation.)";
    case "Liver faliure":
      return "Signs associated with liver issues detected. (Add full diagnosis.)";
    default:
      return "Analyzing...";
  }
}

// Start everything immediately
init();
