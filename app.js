// app.js
import { loadAppData, saveAppData, getDefaultAppData, trialHistory, parseCSVImport, exportTrialData } from "./data.js";
import { initializeUI, setupUIInteractions } from "./ui.js";

// Load or initialize appData
let appData = loadAppData();
if (!appData || Object.keys(appData).length === 0) {
  appData = getDefaultAppData();
  saveAppData(appData);
}

// Initialize the UI
const ui = initializeUI(appData, trialHistory);
ui.populateChildNames();
ui.updateContentAreas();
ui.updateProgramSelect();
ui.updateTargetSelect();
ui.updateInstructions();
ui.updateDescription();
ui.updatePriorResults();

// Set up UI interactions and event listeners
setupUIInteractions(appData, trialHistory);

// Setup CSV import functionality
const importProgramBtn = document.getElementById("importProgramBtn");
const csvFileInput = document.getElementById("csvFileInput");

importProgramBtn.addEventListener("click", () => {
  csvFileInput.click();
});

csvFileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    appData = parseCSVImport(e.target.result, appData);
    // Reinitialize UI with updated appData
    ui.populateChildNames();
    ui.updateContentAreas();
    ui.updateProgramSelect();
    ui.updateTargetSelect();
    ui.updateInstructions();
    ui.updateDescription();
  };
  reader.readAsText(file);
});

// Setup CSV export for trial data
const exportTrialDataBtn = document.getElementById("exportTrialDataBtn");
exportTrialDataBtn.addEventListener("click", () => {
  exportTrialData(trialHistory);
});
