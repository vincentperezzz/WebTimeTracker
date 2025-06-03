let timeData = {};
let activeTabId = null;
let startTime = null;

// Helper function to extract domain from URL
function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}

// Ensure startTime is set before calculating elapsed time
function updateElapsedTime(tabId, now) {
  if (!tabId || typeof tabId !== "number") {
    console.error("Invalid tabId:", tabId);
    return;
  }

  if (!startTime) {
    startTime = now;
    return;
  }

  const elapsed = now - startTime;
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.warn(`Error getting tab with id ${tabId}:`, chrome.runtime.lastError.message);
      return; // Exit gracefully if the tab no longer exists
    }

    if (tab && tab.url) {
      const domain = getDomain(tab.url);
      if (domain) {
        timeData[domain] = (timeData[domain] || 0) + Math.floor(elapsed / 1000);
        chrome.storage.local.set({ [domain]: timeData[domain] }, () => {
          console.log(`Updated time for ${domain}: ${timeData[domain]} seconds`);
        });
      }
    }
  });
}

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    const now = Date.now();
    updateElapsedTime(tabId, now);
    activeTabId = null;
    startTime = null;
  }
});

// Reset data when the browser is reopened
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(null, (storedData) => {
    timeData = storedData || {};
  });
});

// Ensure time tracking continues when the browser is reopened
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(null, (storedData) => {
    timeData = storedData || {};
  });
});

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  if (activeTabId) {
    updateElapsedTime(activeTabId, now);
  }
  activeTabId = activeInfo.tabId;
  startTime = now;
});

// Track tab updates (e.g., URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    const now = Date.now();
    updateElapsedTime(tabId, now);
    startTime = now;
  }
});

// Handle tab removal to stop tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    const now = Date.now();
    updateElapsedTime(tabId, now);
    activeTabId = null;
    startTime = null;
  }
});

// Periodically update time spent on the active tab
setInterval(() => {
  if (activeTabId && startTime) {
    const now = Date.now();
    updateElapsedTime(activeTabId, now);
    startTime = now; // Reset start time for the next interval
  }
}, 1000); // Update every second

// Expose data to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getTimeData") {
    chrome.storage.local.get(null, (storedData) => {
      sendResponse(storedData);
    });
    return true; // Keep the message channel open for async response
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "resetTimeTracking") {
    activeTabId = null;
    startTime = null;
    timeData = {};
    console.log("Time tracking reset");
    sendResponse();
  }
});