// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Paths to your local model
const MODEL_PATH = "./model/";
const modelURL = MODEL_PATH + "model.json";
const metadataURL = MODEL_PATH + "metadata.json";

let model, webcam, maxPredictions;

// DOM elements
const labelElement = document.getElementById("label");
const responseElement = document.getElementById("response");
const cameraContainer = document.getElementById("camera-container");
const buttonContainer = document.getElementById("button-container");

// Initialize everything
async function init() {
  labelElement.innerText = "Loading model...";

const alertDiv = document.getElementById("critical-alert");
if (alertDiv) alertDiv.style.display = "none";

  // Load Teachable Machine model
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Setup webcam
  const flip = true;
  webcam = new tmImage.Webcam(400, 300, flip);
  await webcam.setup();
  await webcam.play();

  // Add webcam feed
  cameraContainer.innerHTML = "";
  cameraContainer.appendChild(webcam.canvas);

  // Start continuous webcam update
  requestAnimationFrame(webcamLoop);

  labelElement.innerText = "Ready for diagnosis";

  // Create Diagnose button
  const button = document.createElement("button");
  button.innerText = "Diagnose";
  button.onclick = runDiagnosis;
  buttonContainer.appendChild(button);
}

// Continuous webcam redraw
function webcamLoop() {
  webcam.update();
  requestAnimationFrame(webcamLoop);
}

// Run diagnosis on button click
async function runDiagnosis() {
  labelElement.innerText = "AI is thinking...";
  responseElement.innerHTML = "";

  const image = webcam.canvas;

  // Simulate AI thinking
  await sleep(3000 + Math.random() * 2000);

  // Predict once
  const prediction = await model.predict(image);
  let best = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > best.probability) best = prediction[i];
  }

  const label = best.className;

  // Show diagnosis with typing effect
  await typeText(responseElement, getDiagnosis(label), 30);

  // Trigger critical alert if necessary
  if (label.toLowerCase().includes("fall") || label.toLowerCase().includes("bike") ||
      label.toLowerCase().includes("horse") || label.toLowerCase().includes("liver")) {
    triggerCriticalAlert();
  }
}

// Typing effect
async function typeText(element, text, delay) {
  element.innerHTML = "";
  labelElement.innerText = ""; // Remove "AI is thinking"

  const lines = text.split("\n");
  if (lines.length === 0) return;

  const firstLine = lines[0]; // Detected message
  const restText = lines.slice(1).join("\n");

  async function typeSection(section, options = {}) {
    const { color = null, bold = false, fontSize = null } = options;
    for (let i = 0; i < section.length; i++) {
      let char = section[i];
      if (char === "\n") {
        element.innerHTML += "<br>";
      } else {
        let style = "";
        if (color) style += `color:${color};`;
        if (bold) style += "font-weight:bold;";
        if (fontSize) style += `font-size:${fontSize};`;
        element.innerHTML += `<span style="${style}">${char}</span>`;
      }
      await sleep(delay);
      element.scrollTop = element.scrollHeight;
    }
  }

  // First line bigger
  await typeSection(firstLine + "\n", { bold: true, fontSize: "1.5em" });

  // Split Analysis and Treatment
  const split = restText.split(/\*\*Treatment:\*\*/i);
  const analysisText = split[0].trim();
  const treatmentText = split[1] ? split[1].trim() : "";

  // Type analysis
  if (analysisText) await typeSection(analysisText + "\n");

  // Type Treatment in pink
  if (treatmentText) {
    await typeSection("Treatment:\n", { color: "#FF80AB", bold: true });
    await typeSection(treatmentText + "\n", { color: "#FF80AB" });
  }
}

// Critical alert
function triggerCriticalAlert() {
  const alertDiv = document.getElementById("critical-alert");
  const alertSound = document.getElementById("critical-sound");

  alertDiv.style.display = "flex";   // show alert
  alertSound.currentTime = 0;
  alertSound.play();

  // Hide alert after sound duration
  setTimeout(() => {
    alertDiv.style.display = "none";
  }, 16000); // matches your 16sec siren
}

// Diagnosis texts
function getDiagnosis(label) {
  switch (label) {
    case "falling accident / bike or horse":
      return "Detected: Falling accident\n\nAnalysis:\n" +
             "You have sustained severe impact injuries to the head. " +
             "Bruises, cuts, swelling, signs of fracture. Immediate assessment of consciousness, breathing, and neurological status is critical.\n\n" +
             "Suggested Treatment:\n" +
             "- Do NOT try to move unnecessarily; keep your head and neck stable.\n" +
             "- Seek medical attention immediately if alone.";

    case "Eye punch":
      return "Detected: Eye trauma.\n\nAnalysis:\n" +
             "Impact to the eye can cause bruising, swelling, redness, or vision disturbances.\n\n" +
             "Suggested Treatment:\n" +
             "- Apply cold compress.\n" +
             "- Avoid rubbing.\n" +
             "- Seek urgent ophthalmologic care if severe.";

    case "Healty face":
      return "Detected: No visible injuries.\n\nAnalysis:\n" +
             "Face appears healthy.\n\nSuggested Treatment:\n" +
             "- Regular skincare.\n";

    case "Dermatitis":
      return "Detected: Possible dermatitis.\n\nAnalysis:\n" +
             "Skin appears red or inflamed.\n\nSuggested Treatment:\n" +
             "- Apply soothing cream.\n" +
             "- Consult dermatologist if worsening.";

    case "Liver faliure":
      return "Detected: Potential liver dysfunction.\n\nAnalysis:\n" +
             "External signs include jaundice or swelling.\n\nSuggested Treatment:\n" +
             "- Seek immediate medical attention.\n" +
             "- Avoid alcohol and liver-straining medications.";

    default:
      return "Healthy face \n "+ 
      "Detected: No visible injuries.\n\nAnalysis:\n" +
             "Face appears healthy.\n\nSuggested Treatment:\n" +
             "- Regular skincare.\n";
  }
}

// Start everything
init();
