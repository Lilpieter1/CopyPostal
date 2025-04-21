// Initialize default settings if not already set
function initializeDefaultSettings() {
  chrome.storage.sync.get('settings', function(data) {
    if (!data.settings) {
      chrome.storage.sync.set({
        settings: {
          enableOnAllSites: true,
          performanceMode: true
        }
      });
    }
  });
}

// Listen for installation or update
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install' || details.reason === 'update') {
    initializeDefaultSettings();
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getCurrentSettings') {
    chrome.storage.sync.get('settings', function(data) {
      sendResponse(data.settings || {
        enableOnAllSites: true,
        performanceMode: true
      });
    });
    return true; // Keep the message channel open for async response
  }
});

// Initialize on startup
initializeDefaultSettings(); 