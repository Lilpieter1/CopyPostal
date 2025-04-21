// This script is for potential future functionality
// Currently, it's just a placeholder

// Default settings
const DEFAULT_SETTINGS = {
  enableOnAllSites: true, // Always true now
  performanceMode: true
};

// Save settings to Chrome storage
function saveSettings(settings) {
  chrome.storage.sync.set({ settings: settings }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error saving settings:', chrome.runtime.lastError);
    }
  });
}

// Load settings from Chrome storage
function loadSettings(callback) {
  chrome.storage.sync.get('settings', function(data) {
    if (chrome.runtime.lastError) {
      console.error('Error loading settings:', chrome.runtime.lastError);
      callback(DEFAULT_SETTINGS);
      return;
    }
    
    const settings = data.settings || DEFAULT_SETTINGS;
    callback(settings);
  });
}

// Update performance mode
function updatePerformanceMode(enabled) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    
    if (!currentTab) return;
    
    // Send message to content script to update its state
    chrome.tabs.sendMessage(currentTab.id, { 
      action: 'updateSettings',
      settings: {
        enableOnAllSites: true,
        performanceMode: enabled
      }
    }, function(response) {
      // Handle potential response
      if (chrome.runtime.lastError) {
        // It's normal to get an error if the content script isn't loaded on this page
        console.log('Content script not available on this page');
      }
    });
  });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  // Get UI elements
  const performanceToggle = document.getElementById('performance-toggle');
  
  // Load saved settings
  loadSettings(function(settings) {
    // Apply settings to UI
    performanceToggle.checked = settings.performanceMode;
    
    // Set up event listeners
    performanceToggle.addEventListener('change', function() {
      const newSettings = {
        enableOnAllSites: true, // Always true now
        performanceMode: this.checked
      };
      
      saveSettings(newSettings);
      updatePerformanceMode(this.checked);
    });
  });
}); 