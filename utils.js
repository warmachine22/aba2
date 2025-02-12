// utils.js
export function childHasActiveRecords(childName, appData) {
  if (!appData[childName]) return false;
  for (const area in appData[childName]) {
    for (const program in appData[childName][area]) {
      for (const target in appData[childName][area][program]) {
        if (appData[childName][area][program][target].active) {
          return true;
        }
      }
    }
  }
  return false;
}
