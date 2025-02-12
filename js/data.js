// data.js

// Local Storage Functions
export function loadAppData() {
  const stored = localStorage.getItem("appData");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing appData", e);
    }
  }
  return null;
}

export function saveAppData(appData) {
  localStorage.setItem("appData", JSON.stringify(appData));
}

// Default sample data if none exists
export function getDefaultAppData() {
  return {
    "Test Child": {
      "Math Skills": {
        "Counting": {
          "Count to 10": { sd: "Count from 1 to 10", note: "Encourage counting", active: true }
        },
        "Shapes": {
          "Identify Circle": { sd: "Identify the circle", note: "Provide visual cues", active: true }
        }
      },
      "Language Skills": {
        "Naming": {
          "Name Colors": { sd: "Name the color", note: "Use flashcards", active: true }
        }
      }
    },
    "Joe Smith": {
      "Visual - Performance": {
        "Single Puzzle": {
          "Puzzle - 1 piece": { sd: '"Do the puzzle" while placing the piece...', note: "Use both hands", active: true },
          "Puzzle - 2 pieces": { sd: '"Do the puzzle" with two pieces...', note: "Encourage problem solving", active: true }
        },
        "Matching": {
          "Color Matching": { sd: '"Match the colors"', note: "Use visual cues", active: true }
        }
      }
    },
    "Jane Doe": {
      "Language - Receptive": {
        "Imitation": {
          "Tracing Letters": { sd: '"Trace the letters"', note: "Focus on letter shapes", active: true }
        },
        "Labeling (Tacts)": {
          "Conversation Skills": { sd: '"Talk about daily activities"', note: "Prompt with questions", active: true }
        }
      }
    },
    "Bob Johnson": {
      "Social Skills": {
        "Social Greetings": {
          "Greeting by name": { sd: '"Say hello to your friend"', note: "Maintain eye contact", active: true }
        },
        "Adaptive Skills": {
          "Sharing Toys": { sd: '"Share your toys with a peer"', note: "Praise sharing behavior", active: true }
        }
      }
    }
  };
}

// Trial History (an array of trial records)
export let trialHistory = [];

// CSV Import Function
export function parseCSVImport(csvText, appData) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) {
    alert("CSV file appears empty.");
    return;
  }
  const header = lines[0].split(",").map(h => h.trim().toLowerCase());
  const expected = ["child", "content area", "program", "target", "sd", "note", "active"];
  if (header.join() !== expected.join()) {
    alert("CSV header does not match expected format. Expected: " + expected.join(", "));
    return;
  }
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = line.split(",").map(f => f.trim());
    if (fields.length < 7) continue;
    const [child, area, program, target, sd, note, activeStr] = fields;
    const active = (activeStr.toLowerCase() === "true" || activeStr === "1");
    if (!appData[child]) { appData[child] = {}; }
    if (!appData[child][area]) { appData[child][area] = {}; }
    if (!appData[child][area][program]) { appData[child][area][program] = {}; }
    appData[child][area][program][target] = { sd, note, active };
  }
  saveAppData(appData);
  alert("CSV import successful.");
  return appData;
}

// CSV Export Function (for trialHistory)
export function exportTrialData(trialHistory) {
  if (trialHistory.length === 0) {
    alert("No trial data to export.");
    return;
  }
  const header = ["Child", "Content Area", "Program", "Target", "Result", "Timestamp"];
  let csvContent = header.join(",") + "\n";
  trialHistory.forEach(record => {
    const row = [
      record.child,
      record.contentArea,
      record.program,
      record.target,
      record.result,
      record.timestamp
    ];
    csvContent += row.map(v => `"${v}"`).join(",") + "\n";
  });
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trial_data.csv";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
