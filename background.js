// var currentDomain = null;
// var startTime = Date.now();

// function getDomainFromUrl(url) {
//     try {
//         const parsedUrl = new URL(url);
//         const domain = parsedUrl.hostname.replace("www.", "");

//         // Ignore internal pages
//         if (
//             url.startsWith("chrome://") ||
//             url.startsWith("chrome-extension://") ||
//             url === "about:blank" ||
//             domain === "newtab"
//         ) {
//             return null;
//         }

//         return domain;
//     } catch {
//         return null;
//     }
// }

// async function updateTime(domain,favUrl) {
//     const duration = Math.floor((Date.now() - startTime) / 1000); // in seconds
//     if (!domain || duration <= 0) return;

//     const today = new Date().setHours(0, 0, 0, 0); // midnight timestamp

//     const storage = await chrome.storage.local.get();

//     // 1. Update today's usage data
//     const dayData = storage[today] || {};
//     dayData[domain] = (dayData[domain] || 0) + duration;

//     // 2. Update global favicon map
//     const icons = storage.icons || {};
//     if (favUrl && favUrl.length && !icons.hasOwnProperty(domain)) {
//         icons[domain] = favUrl;
//     }
//     console.log("data: "+JSON.stringify(storage));

//     // Save both objects back
//     await chrome.storage.local.set({
//         [today]: dayData,
//         icons: icons
//     });
//     // console.log("date: "+today);
    
// }

// async function handleTabChange(activeInfo) {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab || !tab.url) return;
//     console.log("tab: "+ JSON.stringify(tab));
//     // console.log("url: "+tab.url);

//     const newDomain = getDomainFromUrl(tab.url);
//     if(!newDomain){
//         return;
//     }
    
//     const icon=tab.favIconUrl;
//     await updateTime(currentDomain,icon); // update time of old tab
//     currentDomain = newDomain;
//     startTime = Date.now();
// }

// chrome.tabs.onActivated.addListener(handleTabChange);
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (tab.active && changeInfo.status === 'complete') {
//         handleTabChange();
//     }
// });
// chrome.windows.onFocusChanged.addListener(handleTabChange);

// // Fallback flush every 60s — but don’t reset timer
// setInterval(async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     if (!tab || !tab.url) return;

//     const domain = getDomainFromUrl(tab.url);
//     if (!domain) return;

//     const icon = tab.favIconUrl;

//     if (domain === currentDomain) {
//         // Same tab — flush time but don't reset startTime
//         await updateTime(currentDomain); // no icon here
//     } else {
//         // Tab changed but event didn't fire? Handle here
//         await updateTime(currentDomain, icon);
//         currentDomain = domain;
//         startTime = Date.now();
//     }
// }, 60000);

// // System lock/sleep
// chrome.idle.setDetectionInterval(60);
// chrome.idle.onStateChanged.addListener(async (newState) => {
//     if (newState === "locked") {
//         console.log("System locked — flushing time");
//         await updateTime(currentDomain);
//         currentDomain = null;
//         startTime = null;
//     } else if (newState === "active") {
//         console.log("System active — resuming tracking");
//         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//         if (!tab || !tab.url) return;

//         const domain = getDomainFromUrl(tab.url);
//         if (!domain) return;

//         currentDomain = domain;
//         startTime = Date.now();
//     }
// });

// // Chrome about to suspend (e.g. system shutdown or extension unload)
// chrome.runtime.onSuspend.addListener(async () => {
//     console.log("Chrome suspending — flushing time");
//     await updateTime(currentDomain);
// });
// Modified version of the first script to behave like the second

function getDomainFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname.replace("www.", "");
        if (
            url.startsWith("chrome://") ||
            url.startsWith("chrome-extension://") ||
            url === "about:blank" ||
            domain === "newtab"
        ) {
            return null;
        }
        return domain;
    } catch {
        return null;
    }
}

function getCurrentDomain() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length) {
                try {
                    const { url, favIconUrl } = tabs[0];
                    const domain = getDomainFromUrl(url);
                    if (!domain) return resolve("");
                    chrome.storage.local.get(["icons"], ({ icons }) => {
                        icons = icons || {};
                        icons[domain] = favIconUrl;
                        chrome.storage.local.set({ icons }, () => resolve(domain));
                    });
                } catch (error) {
                    resolve("");
                }
            } else {
                resolve("");
            }
        });
    });
}

function setCurrentDomain(domain) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ domain }, () => resolve(domain));
    });
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ domain: "", timestamp: 0 });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes.domain) return;

    const { oldValue, newValue } = changes.domain;
    if (oldValue === newValue) return;

    chrome.storage.local.get(["timestamp"], ({ timestamp }) => {
        if (oldValue && timestamp) {
            const seconds = Math.round((Date.now() - timestamp) / 1000);
            const today = new Date().setHours(0, 0, 0, 0).toString();

            chrome.storage.local.get([today], (result) => {
                const data = result[today] || {};
                data[oldValue] = (data[oldValue] || 0) + seconds;
                chrome.storage.local.set({ [today]: data });
            });
        }
        chrome.storage.local.set({ timestamp: Date.now() });
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        getCurrentDomain().then(setCurrentDomain).then(domain => console.log('updated', domain));
    }
});

chrome.tabs.onActivated.addListener(() => {
    getCurrentDomain().then(setCurrentDomain).then(domain => console.log('activated', domain));
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        setCurrentDomain("").then(() => console.log("blur"));
    } else {
        getCurrentDomain().then(setCurrentDomain).then(domain => console.log('focus', domain));
    }
});

chrome.runtime.onSuspend.addListener(() => {
    setCurrentDomain("").then(() => console.log("suspend"));
});
