// Regular expression to match Dutch postal codes (4 digits + space + 2 letters)
const DUTCH_POSTAL_CODE_REGEX = /\b\d{4}\s[A-Z]{2}\b/g;

// Set this to true to enable debugging
const DEBUG = false;

// Custom class name to identify our processed elements
const POSTAL_CODE_CLASS = 'dutch-postal-code';

// Store already processed nodes to avoid reprocessing
const processedNodes = new WeakSet();
// Store processed postal codes on the page to avoid duplicates
const processedPostalCodes = new Set();

// Current settings with defaults
let settings = {
  performanceMode: true
};

// Load settings from storage
function loadSettings() {
  // Use message passing for settings
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get('settings', function(data) {
      if (data.settings) {
        settings = data.settings;
      }
    });
  }
}

// Debounce function to limit how often processing runs
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Process nodes in batches to avoid UI freezing
function processBatch(nodes, startIdx, batchSize) {
  if (startIdx >= nodes.length) return;
  
  const endIdx = Math.min(startIdx + batchSize, nodes.length);
  const currentBatch = nodes.slice(startIdx, endIdx);
  
  currentBatch.forEach(node => {
    if (processedNodes.has(node)) return;
    
    const parent = node.parentNode;
    if (!parent) return;
    
    // Skip processing if the node is already inside one of our postal code spans
    if (isInsidePostalCodeSpan(node)) return;
    
    const content = node.nodeValue;
    if (!content) return;
    
    let newHtml = content;
    let match;
    
    // Use regex with global flag to find all matches
    DUTCH_POSTAL_CODE_REGEX.lastIndex = 0; // Reset the regex index
    
    const matches = [];
    while ((match = DUTCH_POSTAL_CODE_REGEX.exec(content)) !== null) {
      matches.push({
        text: match[0],
        index: match.index
      });
    }
    
    // If no matches, skip this node
    if (matches.length === 0) return;
    
    // Replace matches with spans, working backwards to maintain indices
    matches.reverse().forEach(match => {
      const postalCode = match.text;
      // Skip if this exact postal code at this node was already processed
      const nodeKey = `${node.textContent}-${match.index}-${postalCode}`;
      if (processedPostalCodes.has(nodeKey)) return;
      processedPostalCodes.add(nodeKey);
      
      const before = newHtml.substring(0, match.index);
      const after = newHtml.substring(match.index + postalCode.length);
      newHtml = before + 
        `<span class="${POSTAL_CODE_CLASS}" data-code="${postalCode}">${postalCode}<button class="copy-postal-code" title="Copy postal code">📋</button></span>` + 
        after;
    });
    
    // Create a temporary element to hold the new HTML
    const tempElement = document.createElement('span');
    tempElement.innerHTML = newHtml;
    
    // Replace the original node with the new content
    while (tempElement.firstChild) {
      parent.insertBefore(tempElement.firstChild, node);
    }
    parent.removeChild(node);
    
    // Mark this node as processed
    processedNodes.add(node);
  });
  
  // Process next batch asynchronously
  if (endIdx < nodes.length) {
    if (settings.performanceMode) {
      setTimeout(() => {
        processBatch(nodes, endIdx, batchSize);
      }, 0);
    } else {
      // In non-performance mode, process faster but may cause UI lag
      processBatch(nodes, endIdx, batchSize);
    }
  } else {
    // After all batches are done, add event listeners
    addEventListenersToCopyButtons();
  }
}

// Add event listeners to copy buttons
function addEventListenersToCopyButtons() {
  document.querySelectorAll('.copy-postal-code:not([data-listener])').forEach(button => {
    button.setAttribute('data-listener', 'true');
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const postalCode = this.parentNode.getAttribute('data-code');
      navigator.clipboard.writeText(postalCode).then(() => {
        // Show feedback
        const originalText = this.textContent;
        this.textContent = '✓';
        this.classList.add('copied');
        
        setTimeout(() => {
          this.textContent = originalText;
          this.classList.remove('copied');
        }, 1500);
      }).catch(err => {
        if (DEBUG) console.error('Failed to copy postal code:', err);
      });
    });
  });
}

// Function to find and mark postal codes on the page
function findAndMarkPostalCodes() {
  // Get text nodes that contain postal codes
  const nodesToModify = [];
  
  // Use TreeWalker for efficient DOM traversal
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip already processed nodes
        if (processedNodes.has(node)) return NodeFilter.FILTER_REJECT;
        
        // Skip nodes in inputs, textareas, or scripts
        if (isInsideInputOrTextArea(node) || 
            isInsideScript(node) || 
            isInsidePostalCodeSpan(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only accept nodes with postal codes
        if (DUTCH_POSTAL_CODE_REGEX.test(node.nodeValue)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        
        return NodeFilter.FILTER_REJECT;
      }
    },
    false
  );
  
  // Collect nodes to modify (limit to maximum nodes for performance)
  let currentNode;
  const maxNodesToProcess = settings.performanceMode ? 200 : 1000;
  
  while ((currentNode = walker.nextNode()) && nodesToModify.length < maxNodesToProcess) {
    nodesToModify.push(currentNode);
  }
  
  // Process nodes in batches
  if (nodesToModify.length > 0) {
    processBatch(nodesToModify, 0, settings.performanceMode ? 10 : 50);
  }
}

// Helper function to check if a node is inside a postal code span
function isInsidePostalCodeSpan(node) {
  let parent = node.parentNode;
  while (parent) {
    if (parent.classList && parent.classList.contains(POSTAL_CODE_CLASS)) {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

// Helper function to check if a node is inside an input or textarea
function isInsideInputOrTextArea(node) {
  let parent = node.parentNode;
  while (parent) {
    if (parent.tagName === 'INPUT' || parent.tagName === 'TEXTAREA') {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

// Helper function to check if a node is inside a script tag
function isInsideScript(node) {
  let parent = node.parentNode;
  while (parent) {
    if (parent.tagName === 'SCRIPT') {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

// Debounced version of findAndMarkPostalCodes
const debouncedFindAndMarkPostalCodes = debounce(findAndMarkPostalCodes, 300);

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateSettings') {
    settings = request.settings;
    // You could apply settings immediately if needed
    sendResponse({ status: 'ok' });
  }
  return true;
});

// Check if a mutation was caused by our own code
function isMutationFromExtension(mutation) {
  // Look at added nodes
  for (let i = 0; i < mutation.addedNodes.length; i++) {
    const node = mutation.addedNodes[i];
    
    // Check if the node or its parent is one of our postal code spans
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList && node.classList.contains(POSTAL_CODE_CLASS)) {
        return true;
      }
      
      if (node.querySelector && node.querySelector(`.${POSTAL_CODE_CLASS}`)) {
        return true;
      }
    }
  }
  
  // Check if the target node is our postal code span
  if (mutation.target.classList && 
      mutation.target.classList.contains(POSTAL_CODE_CLASS)) {
    return true;
  }
  
  return false;
}

// Load settings before initializing
loadSettings();

// Run the function when the page is loaded
document.addEventListener('DOMContentLoaded', debouncedFindAndMarkPostalCodes);

// Also observe for dynamic changes in the DOM
const observer = new MutationObserver(mutations => {
  let shouldProcess = false;
  
  for (const mutation of mutations) {
    // Skip mutations caused by our own extension
    if (isMutationFromExtension(mutation)) {
      continue;
    }
    
    // Only process if new nodes were added
    if (mutation.addedNodes.length > 0) {
      shouldProcess = true;
      break;
    }
  }
  
  if (shouldProcess) {
    debouncedFindAndMarkPostalCodes();
  }
});

// Start observing the document with more limited scope
observer.observe(document.body, { 
  childList: true, 
  subtree: true,
  characterData: false,
  attributes: false
});

// Run initially in case the page is already loaded
// Wait for a short time to let the page finish rendering
setTimeout(debouncedFindAndMarkPostalCodes, 500); 