// document.addEventListener("DOMContentLoaded", () => {
//     const today = new Date().setHours(0, 0, 0, 0).toString();

//     chrome.storage.local.get([today, "icons"], (data) => {
//         const dayData = data[today];
//         const icons = data["icons"] || {};

//         if (!dayData || Object.keys(dayData).length === 0) {
//             document.getElementById("log").innerHTML = `<tr><td colspan="3">No data yet.</td></tr>`;
//             return;
//         }

//         console.log("popup: " + JSON.stringify(data));

//         const total = Object.values(dayData).reduce((a, b) => a + b, 0);
//         const rows = Object.entries(dayData).map(([domain, seconds]) => {
//             const percent = Math.round((seconds / total) * 100);
//             const iconUrl = icons[domain] || `https://${domain}/favicon.ico`; // fallback URL
//             console.log("iconUrl:", iconUrl);
//             return `<tr>
//                 <td><img src="${iconUrl}" alt="${domain}" width=16 height=16 /></td>
//                 <td>${domain}<div class="percent" style="width:${percent}%"></div></td>
//                 <td>${humanReadable(seconds)}</td>
//             </tr>`;
//         });

//         document.getElementById("log").innerHTML = rows.join("");
//     });
// });

document.getElementById("clear-btn").addEventListener("click", clearAllData);

// function humanReadable(sec) {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     if (m === 0) return `${s}s`;
//     if (s === 0) return `${m}m`;
//     return `${m}m ${s}s`;
// }

function clearAllData() {
    chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
            console.error("Error clearing storage:", chrome.runtime.lastError);
        } else {
            console.log("All storage data cleared successfully.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadTodayData();
  loadPastWeekData();
});

function loadTodayData() {
  const today = new Date().setHours(0, 0, 0, 0).toString();

  chrome.storage.local.get([today, "icons"], (data) => {
    const dayData = data[today];
    const icons = data["icons"] || {};

    if (!dayData || Object.keys(dayData).length === 0) {
      document.getElementById(
        "log"
      ).innerHTML = `<tr><td colspan="3">No data yet.</td></tr>`;
      return;
    }

    const total = Object.values(dayData).reduce((a, b) => a + b, 0);
    const rows = Object.entries(dayData).map(([domain, seconds]) => {
      const percent = Math.round((seconds / total) * 100);
      const iconUrl = icons[domain] || `https://${domain}/favicon.ico`;
      return `<tr>
                <td><img src="${iconUrl}" width=16 height=16 /></td>
                <td>${domain}<div class="percent" style="width:${percent}%"></div></td>
                <td>${humanReadable(seconds)}</td>
            </tr>`;
    });

    document.getElementById("log").innerHTML = rows.join("");
  });
}

function loadPastWeekData() {
  const now = new Date();
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d.getTime().toString());
  }

  chrome.storage.local.get(days, (data) => {
    const rows = days.map((timestamp) => {
      // const date = new Date(Number(timestamp)).toDateString();
      const date = new Date(Number(timestamp)).toLocaleDateString("en-US", {
        month: "short", // or "long" for full month name
        day: "numeric",
      });

      const dayData = data[timestamp];

      if (!dayData || Object.keys(dayData).length === 0) {
        return null;
      }
      const total = dayData
        ? Object.values(dayData).reduce((a, b) => a + b, 0)
        : 0;

      return `<tr>
                <td>${date}</td>
                <td>${humanReadable(total)}</td>
            </tr>`;
    });

    document.getElementById("week-log").innerHTML += rows.join("");
  });
}

// function humanReadable(sec) {
//   const m = Math.floor(sec / 60);
//   const h=Math.floor(m/60);
//   m=m-h*60;
//   const s = sec % 60;

//   if(h===0){
//     if(m===0 & s!=0){
//         return `${s}s`;
//     }
//     if(s===0 & m!=0){
//         return `${m}m`;
//     }
//   }

//   if (m === 0) return `${s}s`;
//   if (s === 0) return `${m}m`;
//   return `${h}h ${m}m ${s}s`;
// }
function humanReadable(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h === 0 && m === 0 && s !== 0) return `${s}s`;
  if (h === 0 && m !== 0 && s === 0) return `${m}m`;
  if (h === 0 && m !== 0 && s !== 0) return `${m}m ${s}s`;
  if (h !== 0 && m === 0 && s === 0) return `${h}h`;
  if (h !== 0 && m !== 0 && s === 0) return `${h}h ${m}m`;
  if (h !== 0 && m === 0 && s !== 0) return `${h}h ${s}s`;
  return `${h}h ${m}m ${s}s`;
}

