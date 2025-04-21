// This script checks if the extension should be enabled on all sites
// and conditionally injects the main content script

// Check settings to determine if we should activate on this site
function checkSettings() {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get('settings', function(data) {
      if (data.settings && data.settings.enableOnAllSites) {
        // If enabled for all sites, inject the main content script and CSS
        injectMainContentScript();
      }
    });
  }
}

// Inject the main content script programmatically
function injectMainContentScript() {
  // Inject CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('content.css');
  document.head.appendChild(link);
  
  // Inject the main content script
  fetch(chrome.runtime.getURL('content.js'))
    .then(response => response.text())
    .then(scriptText => {
      const script = document.createElement('script');
      script.textContent = scriptText;
      document.head.appendChild(script);
      document.head.removeChild(script); // Remove after execution
    })
    .catch(error => {
      console.error('Error injecting Dutch Postal Code Copier script:', error);
    });
}

// Listen for setting changes
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateSettings' && request.settings.enableOnAllSites) {
    injectMainContentScript();
    sendResponse({ status: 'ok' });
  }
  return true;
});

// Check settings when the script loads
checkSettings(); 