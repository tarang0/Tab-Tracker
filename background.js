
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
    console.log("installed");
    chrome.storage.local.set({ domain: "", timestamp: 0 });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log("areaname: "+areaName);
    console.log("changes: "+ JSON.stringify(changes));
    if (areaName !== "local" || !changes.domain) return;

    const { oldValue, newValue } = changes.domain;
    if (oldValue === newValue) return;

    chrome.storage.local.get(["timestamp"], ({ timestamp }) => {
        if (oldValue && timestamp) {
            const seconds = Math.round((Date.now() - timestamp) / 1000);
            console.log("adding seconds: "+seconds);
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
        getCurrentDomain().then(setCurrentDomain).then(domain => console.log('updated: ', domain));
    }
});

chrome.tabs.onActivated.addListener(() => {
    getCurrentDomain().then(setCurrentDomain).then(domain => console.log('activated: ', domain));
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        setCurrentDomain("").then(() => console.log("focussed out of chrome"));
    } else {
        getCurrentDomain().then(setCurrentDomain).then(domain => console.log('focus back in: ', domain));
    }
});

chrome.runtime.onSuspend.addListener(() => {
    setCurrentDomain("").then(() => console.log("suspend"));
});