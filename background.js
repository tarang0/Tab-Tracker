// // // var currentDomain = null;
// // // var startTime = Date.now();

// // // function getDomainFromUrl(url) {
// // //     try {
// // //         const parsedUrl = new URL(url);
// // //         const domain = parsedUrl.hostname.replace("www.", "");

// // //         // Ignore internal pages
// // //         if (
// // //             url.startsWith("chrome://") ||
// // //             url.startsWith("chrome-extension://") ||
// // //             url === "about:blank" ||
// // //             domain === "newtab"
// // //         ) {
// // //             return null;
// // //         }

// // //         return domain;
// // //     } catch {
// // //         return null;
// // //     }
// // // }

// // // async function updateTime(domain,favUrl) {
// // //     const duration = Math.floor((Date.now() - startTime) / 1000); // in seconds
// // //     if (!domain || duration <= 0) return;

// // //     const today = new Date().setHours(0, 0, 0, 0); // midnight timestamp

// // //     const storage = await chrome.storage.local.get();

// // //     // 1. Update today's usage data
// // //     const dayData = storage[today] || {};
// // //     dayData[domain] = (dayData[domain] || 0) + duration;

// // //     // 2. Update global favicon map
// // //     const icons = storage.icons || {};
// // //     if (favUrl && favUrl.length && !icons.hasOwnProperty(domain)) {
// // //         icons[domain] = favUrl;
// // //     }
// // //     console.log("data: "+JSON.stringify(storage));

// // //     // Save both objects back
// // //     await chrome.storage.local.set({
// // //         [today]: dayData,
// // //         icons: icons
// // //     });
// // //     // console.log("date: "+today);

// // // }

// // // async function handleTabChange(activeInfo) {
// // //     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //     if (!tab || !tab.url) return;
// // //     console.log("tab: "+ JSON.stringify(tab));
// // //     // console.log("url: "+tab.url);

// // //     const newDomain = getDomainFromUrl(tab.url);
// // //     if(!newDomain){
// // //         return;
// // //     }

// // //     const icon=tab.favIconUrl;
// // //     await updateTime(currentDomain,icon); // update time of old tab
// // //     currentDomain = newDomain;
// // //     startTime = Date.now();
// // // }

// // // chrome.tabs.onActivated.addListener(handleTabChange);
// // // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
// // //     if (tab.active && changeInfo.status === 'complete') {
// // //         handleTabChange();
// // //     }
// // // });
// // // chrome.windows.onFocusChanged.addListener(handleTabChange);

// // // // Fallback flush every 60s — but don’t reset timer
// // // setInterval(async () => {
// // //     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //     if (!tab || !tab.url) return;

// // //     const domain = getDomainFromUrl(tab.url);
// // //     if (!domain) return;

// // //     const icon = tab.favIconUrl;

// // //     if (domain === currentDomain) {
// // //         // Same tab — flush time but don't reset startTime
// // //         await updateTime(currentDomain); // no icon here
// // //     } else {
// // //         // Tab changed but event didn't fire? Handle here
// // //         await updateTime(currentDomain, icon);
// // //         currentDomain = domain;
// // //         startTime = Date.now();
// // //     }
// // // }, 60000);

// // // // System lock/sleep
// // // chrome.idle.setDetectionInterval(60);
// // // chrome.idle.onStateChanged.addListener(async (newState) => {
// // //     if (newState === "locked") {
// // //         console.log("System locked — flushing time");
// // //         await updateTime(currentDomain);
// // //         currentDomain = null;
// // //         startTime = null;
// // //     } else if (newState === "active") {
// // //         console.log("System active — resuming tracking");
// // //         const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// // //         if (!tab || !tab.url) return;

// // //         const domain = getDomainFromUrl(tab.url);
// // //         if (!domain) return;

// // //         currentDomain = domain;
// // //         startTime = Date.now();
// // //     }
// // // });

// // // // Chrome about to suspend (e.g. system shutdown or extension unload)
// // // chrome.runtime.onSuspend.addListener(async () => {
// // //     console.log("Chrome suspending — flushing time");
// // //     await updateTime(currentDomain);
// // // });
// // // Modified version of the first script to behave like the second

// // function getDomainFromUrl(url) {
// //   try {
// //     const parsedUrl = new URL(url);
// //     const domain = parsedUrl.hostname.replace("www.", "");
// //     if (
// //       url.startsWith("chrome://") ||
// //       url.startsWith("chrome-extension://") ||
// //       url === "about:blank" ||
// //       domain === "newtab"
// //     ) {
// //       return null;
// //     }
// //     return domain;
// //   } catch {
// //     return null;
// //   }
// // }

// // function getCurrentDomain() {
// //   return new Promise((resolve) => {
// //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// //       if (tabs && tabs.length) {
// //         try {
// //           const { url, favIconUrl } = tabs[0];
// //           const domain = getDomainFromUrl(url);
// //           if (!domain) return resolve("");
// //           chrome.storage.local.get(["icons"], ({ icons }) => {
// //             icons = icons || {};
// //             icons[domain] = favIconUrl;
// //             chrome.storage.local.set({ icons }, () => resolve(domain));
// //           });
// //         } catch (error) {
// //           resolve("");
// //         }
// //       } else {
// //         resolve("");
// //       }
// //     });
// //   });
// // }

// // function setCurrentDomain(domain) {
// //   return new Promise((resolve) => {
// //     chrome.storage.local.set({ domain }, () => resolve(domain));
// //   });
// // }

// // chrome.runtime.onInstalled.addListener(() => {
// //   chrome.storage.local.set({ domain: "", timestamp: 0 });
// // });

// // chrome.storage.onChanged.addListener((changes, areaName) => {
// //   if (areaName !== "local" || !changes.domain) return;

// //   const { oldValue, newValue } = changes.domain;
// //   if (oldValue === newValue) return;

// //   chrome.storage.local.get(["timestamp"], ({ timestamp }) => {
// //     if (oldValue && timestamp) {
// //       const seconds = Math.round((Date.now() - timestamp) / 1000);
// //       const today = new Date().setHours(0, 0, 0, 0).toString();

// //       chrome.storage.local.get([today], (result) => {
// //         const data = result[today] || {};
// //         data[oldValue] = (data[oldValue] || 0) + seconds;
// //         chrome.storage.local.set({ [today]: data });
// //       });
// //     }
// //     chrome.storage.local.set({ timestamp: Date.now() });
// //   });
// // });

// // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
// //   if (changeInfo.status === "complete") {
// //     getCurrentDomain()
// //       .then(setCurrentDomain)
// //       .then((domain) => console.log("updated", domain));
// //   }
// // });

// // chrome.tabs.onActivated.addListener(() => {
// //   getCurrentDomain()
// //     .then(setCurrentDomain)
// //     .then((domain) => console.log("activated", domain));
// // });

// // // chrome.windows.onFocusChanged.addListener((windowId) => {
// // //     if (windowId === chrome.windows.WINDOW_ID_NONE) {
// // //         setCurrentDomain("").then(() => console.log("blur"));
// // //     } else {
// // //         getCurrentDomain().then(setCurrentDomain).then(domain => console.log('focus', domain));
// // //     }
// // // });
// // // chrome.windows.onFocusChanged.addListener((windowId) => {
// // //     if (windowId === chrome.windows.WINDOW_ID_NONE) {
// // //         // No Chrome window is focused — probably using VS Code or other app
// // //         setCurrentDomain("").then(() => console.log("Chrome unfocused — stopped tracking"));
// // //     } else {
// // //         getCurrentDomain().then(setCurrentDomain).then(domain =>
// // //             console.log("Chrome focused — resumed tracking:", domain)
// // //         );
// // //     }
// // // });
// // chrome.windows.onFocusChanged.addListener((windowId) => {
// //     if (windowId === chrome.windows.WINDOW_ID_NONE) {
// //         // Lost focus — flush time
// //         chrome.storage.local.get(["domain", "timestamp"], ({ domain, timestamp }) => {
// //             if (domain && timestamp) {
// //                 const seconds = Math.round((Date.now() - timestamp) / 1000);
// //                 const today = new Date().setHours(0, 0, 0, 0).toString();

// //                 chrome.storage.local.get([today], (result) => {
// //                     const data = result[today] || {};
// //                     data[domain] = (data[domain] || 0) + seconds;
// //                     chrome.storage.local.set({ [today]: data, domain: "", timestamp: 0 }, () =>
// //                         console.log("Flushed time due to blur")
// //                     );
// //                 });
// //             }
// //         });
// //     } else {
// //         // Gained focus — restart tracking
// //         getCurrentDomain().then(domain => {
// //             chrome.storage.local.set({ domain, timestamp: Date.now() }, () =>
// //                 console.log("Resumed tracking for", domain)
// //             );
// //         });
// //     }
// // });

// // chrome.idle.onStateChanged.addListener((state) => {
// //     if (state === "locked") {
// //         // Only flush when system is locked or sleeping
// //         setCurrentDomain("").then(() => console.log("System locked — stopped tracking"));
// //     } else if (state === "active") {
// //         getCurrentDomain().then(setCurrentDomain).then(domain =>
// //             console.log("System unlocked — resumed tracking:", domain)
// //         );
// //     }
// // });
// // // chrome.idle.setDetectionInterval(15); // optional

// // chrome.runtime.onSuspend.addListener(() => {
// //   setCurrentDomain("").then(() => console.log("suspend"));
// // });
// let chromeFocused = true;

// function getDomainFromUrl(url) {
//     try {
//         const parsedUrl = new URL(url);
//         const domain = parsedUrl.hostname.replace("www.", "");
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

// function getCurrentDomainInfo() {
//     return new Promise((resolve) => {
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             if (!tabs || !tabs.length) return resolve(null);
//             try {
//                 const { url, favIconUrl } = tabs[0];
//                 const domain = getDomainFromUrl(url);
//                 if (!domain) return resolve(null);

//                 chrome.storage.local.get(["icons"], ({ icons }) => {
//                     icons = icons || {};
//                     icons[domain] = favIconUrl;
//                     chrome.storage.local.set({ icons }, () => resolve(domain));
//                 });
//             } catch {
//                 resolve(null);
//             }
//         });
//     });
// }

// async function flushTime(oldDomain) {
//     if (!oldDomain) return;

//     const { timestamp } = await chrome.storage.local.get(["timestamp"]);
//     if (!timestamp) return;

//     const duration = Math.round((Date.now() - timestamp) / 1000);
//     if (duration <= 0) return;

//     const todayKey = new Date().setHours(0, 0, 0, 0).toString();
//     const storage = await chrome.storage.local.get([todayKey]);
//     const dayData = storage[todayKey] || {};

//     dayData[oldDomain] = (dayData[oldDomain] || 0) + duration;

//     await chrome.storage.local.set({
//         [todayKey]: dayData
//     });

//     console.log(`Flushed ${duration}s for ${oldDomain}`);
// }

// // async function setDomain(newDomain) {
// //     const { domain: oldDomain } = await chrome.storage.local.get(["domain"]);
// //     if (oldDomain && oldDomain !== newDomain) {
// //         await flushTime(oldDomain);
// //     }

// //     if (newDomain) {
// //         await chrome.storage.local.set({
// //             domain: newDomain,
// //             timestamp: Date.now()
// //         });
// //         console.log("Tracking started for", newDomain);
// //     } else {
// //         await flushTime(oldDomain);
// //         await chrome.storage.local.set({ domain: "", timestamp: 0 });
// //         console.log("Stopped tracking");
// //     }
// // }
// // async function setDomain(newDomain) {
// //     const { domain: oldDomain } = await chrome.storage.local.get(["domain"]);

// //     if (oldDomain && oldDomain !== newDomain) {
// //         if (chromeFocused) {
// //             await flushTime(oldDomain);
// //         } else {
// //             console.log("Skipped flushing because Chrome not focused");
// //         }
// //     }

// //     if (newDomain) {
// //         await chrome.storage.local.set({
// //             domain: newDomain,
// //             timestamp: Date.now()
// //         });
// //         console.log("Tracking started for", newDomain);
// //     } else {
// //         // Still update timestamp so that when focus returns, duration is not falsely computed
// //         await chrome.storage.local.set({ domain: "", timestamp: 0 });
// //         console.log("Stopped tracking");
// //     }
// // }
// async function setDomain(newDomain) {
//     const { domain: oldDomain } = await chrome.storage.local.get(["domain"]);

//     if (oldDomain === newDomain) return;

//     if (oldDomain && newDomain !== oldDomain) {
//         if (chromeFocused) {
//             await flushTime(oldDomain);
//         } else {
//             console.log("Skipped flushing because Chrome not focused");
//         }
//     }

//     if (newDomain) {
//         await chrome.storage.local.set({
//             domain: newDomain,
//             timestamp: Date.now()
//         });
//         console.log("Tracking started for", newDomain);
//     } else {
//         await chrome.storage.local.set({ domain: "", timestamp: 0 });
//         console.log("Stopped tracking");
//     }
// }



// // On extension install — reset state
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.local.set({ domain: "", timestamp: 0 });
// });

// // When active tab is updated
// chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
//     if (changeInfo.status === "complete") {
//         getCurrentDomainInfo().then(domain => {
//             if (domain !== null) {
//                 setDomain(domain);
//             }
//         });
//     }
// });

// // When tab is switched
// chrome.tabs.onActivated.addListener(() => {
//     getCurrentDomainInfo().then(domain => {
//         if (domain !== null) {
//             setDomain(domain);
//         }
//     });
// });

// // When Chrome window focus changes (like switching to VS Code)
// // chrome.windows.onFocusChanged.addListener((windowId) => {
// //     if (windowId === chrome.windows.WINDOW_ID_NONE) {
// //         // Chrome unfocused — stop tracking
// //         setDomain("");
// //     } else {
// //         // Chrome refocused — resume
// //         getCurrentDomainInfo().then(domain => {
// //             if (domain !== null) {
// //                 setDomain(domain);
// //             }
// //         });
// //     }
// // });

// chrome.windows.onFocusChanged.addListener((windowId) => {
//     if (windowId === chrome.windows.WINDOW_ID_NONE) {
//         chromeFocused = false;
//         setDomain("");
//     } else {
//         chromeFocused = true;
//         getCurrentDomainInfo().then(domain => {
//             if (domain !== null) {
//                 setDomain(domain);
//             }
//         });
//     }
// });


// // Chrome shutting down
// chrome.runtime.onSuspend.addListener(() => {
//     setDomain("");
// });

let chromeFocused = true;

// Get valid domain
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

// Get current tab's domain + favicon
function getCurrentDomainInfo() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs.length) return resolve(null);

            const { url, favIconUrl } = tabs[0];
            const domain = getDomainFromUrl(url);
            if (!domain) return resolve(null);

            chrome.storage.local.get(["icons"], ({ icons = {} }) => {
                icons[domain] = favIconUrl;
                chrome.storage.local.set({ icons }, () => resolve(domain));
            });
        });
    });
}

// Save time difference for old domain
async function flushTime(oldDomain) {
    if (!oldDomain) return;

    const { timestamp } = await chrome.storage.local.get(["timestamp"]);
    if (!timestamp) return;

    const seconds = Math.round((Date.now() - timestamp) / 1000);
    if (seconds <= 0 || seconds > 3000) return; // Ignore invalid or stuck times

    const today = new Date().setHours(0, 0, 0, 0).toString();

    chrome.storage.local.get([today], (result) => {
        const data = result[today] || {};
        data[oldDomain] = (data[oldDomain] || 0) + seconds;
        chrome.storage.local.set({ [today]: data }, () => {
            console.log(`Flushed ${seconds}s for ${oldDomain}`);
        });
    });
}

// Called whenever domain changes or tracking stops
async function setDomain(newDomain) {
    const { domain: oldDomain } = await chrome.storage.local.get(["domain"]);

    if (oldDomain === newDomain) return;

    console.log(`Focus: ${chromeFocused} | Domain changed from ${oldDomain} → ${newDomain}`);

    if (oldDomain && newDomain !== oldDomain) {
        if (chromeFocused) {
            await flushTime(oldDomain);
        } else {
            console.log("Skipped flushing because Chrome not focused");
        }
    }

    if (newDomain) {
        await chrome.storage.local.set({
            domain: newDomain,
            timestamp: Date.now()
        });
        console.log("Tracking started for", newDomain);
    } else {
        await chrome.storage.local.set({ domain: "", timestamp: 0 });
        console.log("Stopped tracking");
    }
}

// On extension install/init
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ domain: "", timestamp: 0 });
});

// Tab change handlers
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete" && chromeFocused) {
        getCurrentDomainInfo().then(setDomain);
    }
});

chrome.tabs.onActivated.addListener(() => {
    if (chromeFocused) {
        getCurrentDomainInfo().then(setDomain);
    }
});

// Focus detection (accurate)
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        chromeFocused = false;
        setDomain(""); // Stop tracking
    } else {
        chrome.windows.get(windowId, (win) => {
            if (chrome.runtime.lastError || !win || !win.focused) {
                chromeFocused = false;
                setDomain("");
            } else {
                chromeFocused = true;
                getCurrentDomainInfo().then(domain => {
                    if (domain) setDomain(domain);
                });
            }
        });
    }
});

// In case browser or extension is suspended
chrome.runtime.onSuspend.addListener(() => {
    setDomain("");
});
