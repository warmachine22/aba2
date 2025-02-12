// ui.js
import { childHasActiveRecords } from "./utils.js";
import { saveAppData } from "./data.js";

export function initializeUI(appData, trialHistory) {
  // Get DOM elements
  const childNameSelect = document.getElementById("childNameSelect");
  const contentAreaSelect = document.getElementById("contentAreaSelect");
  const programSelect = document.getElementById("programSelect");
  const targetSelect = document.getElementById("targetSelect");
  const sdInput = document.getElementById("sdInput");
  const notesArea = document.getElementById("notesArea");
  const descriptionP = document.getElementById("selectedDescription");
  const priorList = document.getElementById("priorList");
  
  // Populate child names (only those with active targets)
  function populateChildNames() {
    childNameSelect.innerHTML = "";
    const validChildren = Object.keys(appData).filter(child => childHasActiveRecords(child, appData));
    validChildren.forEach(child => {
      const opt = document.createElement("option");
      opt.value = child;
      opt.textContent = child;
      childNameSelect.appendChild(opt);
    });
    if (!validChildren.includes(childNameSelect.value) && validChildren.length) {
      childNameSelect.value = validChildren[0];
    }
  }
  
  function updateContentAreas() {
    const selectedChild = childNameSelect.value;
    contentAreaSelect.innerHTML = "";
    if (appData[selectedChild]) {
      Object.keys(appData[selectedChild]).forEach(area => {
        const opt = document.createElement("option");
        opt.value = area;
        opt.textContent = area;
        contentAreaSelect.appendChild(opt);
      });
    }
  }
  
  function updateProgramSelect() {
    const selectedChild = childNameSelect.value;
    const selectedArea = contentAreaSelect.value;
    programSelect.innerHTML = "";
    if (appData[selectedChild] && appData[selectedChild][selectedArea]) {
      Object.keys(appData[selectedChild][selectedArea]).forEach(prog => {
        const opt = document.createElement("option");
        opt.value = prog;
        opt.textContent = prog;
        programSelect.appendChild(opt);
      });
    }
  }
  
  function updateTargetSelect() {
    const selectedChild = childNameSelect.value;
    const selectedArea = contentAreaSelect.value;
    const selectedProgram = programSelect.value;
    targetSelect.innerHTML = "";
    if (appData[selectedChild] &&
        appData[selectedChild][selectedArea] &&
        appData[selectedChild][selectedArea][selectedProgram]) {
      Object.keys(appData[selectedChild][selectedArea][selectedProgram])
        .filter(target => appData[selectedChild][selectedArea][selectedProgram][target].active)
        .forEach(target => {
          const opt = document.createElement("option");
          opt.value = target;
          opt.textContent = target;
          targetSelect.appendChild(opt);
        });
    }
  }
  
  function updateInstructions() {
    const selectedChild = childNameSelect.value;
    const selectedArea = contentAreaSelect.value;
    const selectedProgram = programSelect.value;
    const selectedTarget = targetSelect.value;
    if (appData[selectedChild] &&
        appData[selectedChild][selectedArea] &&
        appData[selectedChild][selectedArea][selectedProgram] &&
        appData[selectedChild][selectedArea][selectedProgram][selectedTarget]) {
      const rec = appData[selectedChild][selectedArea][selectedProgram][selectedTarget];
      sdInput.value = rec.sd;
      notesArea.value = rec.note;
    } else {
      sdInput.value = "";
      notesArea.value = "";
    }
  }
  
  function updateDescription() {
    descriptionP.textContent = `${childNameSelect.value} -- ${contentAreaSelect.value} -- ${programSelect.value} -- ${targetSelect.value}`;
  }
  
  function updatePriorResults() {
    const selectedChild = childNameSelect.value;
    const currentArea = contentAreaSelect.value;
    const currentProgram = programSelect.value;
    const currentTarget = targetSelect.value;
    const filtered = trialHistory.filter(item =>
      item.child === selectedChild &&
      item.contentArea === currentArea &&
      item.program === currentProgram &&
      item.target === currentTarget
    );
    const lastFive = filtered.slice(-5);
    priorList.innerHTML = "";
    for (let i = lastFive.length - 1; i >= 0; i--) {
      const li = document.createElement("li");
      li.textContent = lastFive[i].result.charAt(0).toUpperCase() + lastFive[i].result.slice(1);
      li.className = lastFive[i].result;
      priorList.appendChild(li);
    }
  }
  
  // Set up event listeners for dropdowns
  childNameSelect.addEventListener('change', () => {
    updateContentAreas();
    updateProgramSelect();
    updateTargetSelect();
    updateInstructions();
    updateDescription();
    updatePriorResults();
  });
  contentAreaSelect.addEventListener('change', () => {
    updateProgramSelect();
    updateTargetSelect();
    updateInstructions();
    updateDescription();
    updatePriorResults();
  });
  programSelect.addEventListener('change', () => {
    updateTargetSelect();
    updateInstructions();
    updateDescription();
    updatePriorResults();
  });
  targetSelect.addEventListener('change', () => {
    updateInstructions();
    updateDescription();
    updatePriorResults();
  });
  
  return {
    populateChildNames,
    updateContentAreas,
    updateProgramSelect,
    updateTargetSelect,
    updateInstructions,
    updateDescription,
    updatePriorResults
  };
}

export function setupUIInteractions(appData, trialHistory) {
  const selectRandomBtn = document.getElementById("selectRandomBtn");
  const toggleDetailsBtn = document.getElementById("toggleDetailsBtn");
  const topSection = document.getElementById("topSection");
  const trialRadios = document.querySelectorAll('input[name="trialResult"]');
  const dataTableContainer = document.getElementById("dataTableContainer");
  const toggleDataTableBtn = document.getElementById("toggleDataTableBtn");
  
  // Randomize trial selection
  selectRandomBtn.addEventListener("click", () => {
    randomizeTrialData(appData);
  });
  
  // Toggle details section
  toggleDetailsBtn.addEventListener("click", () => {
    if (topSection.style.display === 'none' || topSection.style.display === '') {
      topSection.style.display = 'block';
      toggleDetailsBtn.textContent = 'Hide Details';
    } else {
      topSection.style.display = 'none';
      toggleDetailsBtn.textContent = 'View Details';
    }
  });
  
  // Record trial data when a radio button is selected
  trialRadios.forEach(radio => {
    radio.addEventListener("change", e => {
      recordTrial(e.target.value, appData, trialHistory);
    });
  });
  
  // Toggle data table in Manage Data section
  toggleDataTableBtn.addEventListener("click", () => {
    if (dataTableContainer.style.display === "none" || dataTableContainer.style.display === "") {
      dataTableContainer.style.display = "block";
      toggleDataTableBtn.textContent = "Hide Full Program";
      buildDataTable(appData);
    } else {
      dataTableContainer.style.display = "none";
      toggleDataTableBtn.textContent = "Show Full Program";
    }
  });
}

// --- Internal functions for UI interactions ---

function randomizeTrialData(appData) {
  const childNameSelect = document.getElementById("childNameSelect");
  const contentAreaSelect = document.getElementById("contentAreaSelect");
  const programSelect = document.getElementById("programSelect");
  const targetSelect = document.getElementById("targetSelect");
  
  const selectedChild = childNameSelect.value;
  if (!appData[selectedChild]) return;
  const childData = appData[selectedChild];
  const contentAreas = Object.keys(childData);
  if (contentAreas.length === 0) return;
  const randomArea = contentAreas[Math.floor(Math.random() * contentAreas.length)];
  contentAreaSelect.value = randomArea;
  
  // Update program and target dropdowns
  if (childData[randomArea]) {
    const programs = Object.keys(childData[randomArea]);
    if (programs.length === 0) return;
    const randomProgram = programs[Math.floor(Math.random() * programs.length)];
    programSelect.value = randomProgram;
    if (childData[randomArea][randomProgram]) {
      const targets = Object.keys(childData[randomArea][randomProgram]).filter(t => childData[randomArea][randomProgram][t].active);
      if (targets.length === 0) return;
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      targetSelect.value = randomTarget;
    }
  }
  // Dispatch change events to update UI
  childNameSelect.dispatchEvent(new Event("change"));
}

function recordTrial(result, appData, trialHistory) {
  const childNameSelect = document.getElementById("childNameSelect");
  const contentAreaSelect = document.getElementById("contentAreaSelect");
  const programSelect = document.getElementById("programSelect");
  const targetSelect = document.getElementById("targetSelect");
  
  const record = {
    child: childNameSelect.value,
    contentArea: contentAreaSelect.value,
    program: programSelect.value,
    target: targetSelect.value,
    result: result,
    timestamp: new Date().toISOString()
  };
  trialHistory.push(record);
  // Update UI after recording trial
  targetSelect.dispatchEvent(new Event("change"));
}

function buildDataTable(appData) {
  const dataTable = document.getElementById("dataTable");
  let rows = [];
  Object.keys(appData).forEach(child => {
    Object.keys(appData[child]).forEach(area => {
      Object.keys(appData[child][area]).forEach(prog => {
        Object.keys(appData[child][area][prog]).forEach(targ => {
          const rec = appData[child][area][prog][targ];
          rows.push({
            child: child,
            contentArea: area,
            program: prog,
            target: targ,
            sd: rec.sd,
            note: rec.note,
            active: rec.active
          });
        });
      });
    });
  });
  
  const columns = ["Child", "Active", "Content Area", "Program", "Target", "SD", "Note", "Action"];
  let thead = "<thead><tr>";
  columns.forEach((col, index) => {
    if (col !== "Action") {
      thead += `<th data-col="${index}" class="sortable">${col}</th>`;
    } else {
      thead += `<th>${col}</th>`;
    }
  });
  thead += "</tr>";
  thead += "<tr class='filterRow'>";
  columns.forEach((col, index) => {
    if (col === "Active" || col === "Action") {
      thead += "<th></th>";
    } else {
      thead += `<th><input type="text" data-col="${index}" placeholder="Filter ${col}" /></th>`;
    }
  });
  thead += "</tr></thead>";
  
  let tbody = "<tbody>";
  rows.forEach(row => {
    tbody += "<tr>";
    tbody += `<td>${row.child}</td>`;
    tbody += `<td style="text-align: center;"><input type="checkbox" class="activeCheckbox" data-child="${row.child}" data-contentArea="${row.contentArea}" data-program="${row.program}" data-target="${row.target}" ${row.active ? "checked" : ""} /></td>`;
    tbody += `<td>${row.contentArea}</td>`;
    tbody += `<td>${row.program}</td>`;
    tbody += `<td>${row.target}</td>`;
    tbody += `<td>${row.sd}</td>`;
    tbody += `<td>${row.note}</td>`;
    tbody += `<td><button class="tableEditBtn" data-child="${row.child}" data-contentArea="${row.contentArea}" data-program="${row.program}" data-target="${row.target}">Edit</button></td>`;
    tbody += "</tr>";
  });
  tbody += "</tbody>";
  
  dataTable.innerHTML = thead + tbody;
  
  // Setup sorting and filtering
  const sortableHeaders = dataTable.querySelectorAll("th.sortable");
  sortableHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const colIndex = header.getAttribute("data-col");
      sortTable(colIndex);
    });
  });
  
  const filterInputs = dataTable.querySelectorAll("thead tr.filterRow input");
  filterInputs.forEach(input => {
    input.addEventListener("keyup", filterTable);
  });
  
  // (Optional) Setup edit buttons and active checkbox listeners here.
}

function sortTable(colIndex) {
  const dataTable = document.getElementById("dataTable");
  const tbody = dataTable.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  let sortOrder = 1;
  rows.sort((a, b) => {
    const aText = a.children[colIndex].textContent.toLowerCase();
    const bText = b.children[colIndex].textContent.toLowerCase();
    if (aText < bText) return -1 * sortOrder;
    if (aText > bText) return 1 * sortOrder;
    return 0;
  });
  sortOrder *= -1;
  rows.forEach(row => tbody.appendChild(row));
}

function filterTable() {
  const dataTable = document.getElementById("dataTable");
  const filters = {};
  const inputs = dataTable.querySelectorAll("thead tr.filterRow input");
  inputs.forEach(input => {
    const col = input.getAttribute("data-col");
    filters[col] = input.value.toLowerCase();
  });
  const tbody = dataTable.querySelector("tbody");
  const rows = tbody.querySelectorAll("tr");
  rows.forEach(row => {
    let show = true;
    for (let i = 1; i < row.children.length - 1; i++) {
      const cellText = row.children[i].textContent.toLowerCase();
      if (filters[i+1] && !cellText.includes(filters[i+1])) {
        show = false;
        break;
      }
    }
    row.style.display = show ? "" : "none";
  });
}
