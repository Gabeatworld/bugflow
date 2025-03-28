// Debug: Log immediately when script starts
console.log('🔄 Commenter loader script starting...');

// Debug: Log current script information
const currentScript = document.currentScript;
console.log('Current script:', currentScript);
console.log('Current script src:', currentScript ? currentScript.src : 'No current script');

// Debug: Log document information
console.log('Document readyState:', document.readyState);
console.log('Document location:', window.location.href);

// Create a visible indicator that the system is loading
function createLoadingIndicator() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;
  indicator.textContent = 'Loading Comment System...';
  document.body.appendChild(indicator);
  return indicator;
}

// Load required dependencies
function loadScript(url) {
  return new Promise((resolve, reject) => {
    console.log(`Loading script: ${url}`);
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log(`Script loaded: ${url}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Script failed to load: ${url}`, error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}

// Load required styles
function loadStyles(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Initialize the commenter
async function initCommenter() {
  const loadingIndicator = createLoadingIndicator();
  
  try {
    console.log('Starting to load dependencies...');
    
    // Load dependencies
    await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');
    await loadScript('https://cdn.tailwindcss.com');
    
    // Load the commenter script from jsDelivr
    console.log('Loading main commenter script...');
    await loadScript('https://cdn.jsdelivr.net/gh/Gabeatworld/bugflow@main/public/commenter.js');
    
    // Check if WebsiteCommenter is defined
    if (typeof WebsiteCommenter === 'undefined') {
      throw new Error('WebsiteCommenter class not found after loading script');
    }
    
    // Initialize the commenter
    console.log('Creating WebsiteCommenter instance...');
    new WebsiteCommenter();
    
    // Update loading indicator
    loadingIndicator.textContent = 'Comment System Ready!';
    loadingIndicator.style.background = '#2196F3';
    
    // Remove indicator after 3 seconds
    setTimeout(() => {
      loadingIndicator.remove();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to load commenting system:', error);
    loadingIndicator.textContent = 'Failed to load Comment System';
    loadingIndicator.style.background = '#f44336';
    loadingIndicator.style.cursor = 'pointer';
    loadingIndicator.onclick = () => {
      console.error('Error details:', error);
      alert('Failed to load commenting system. Check console for details.');
    };
  }
}

// Start loading when the page is ready
console.log('Commenter loader initialized');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommenter);
} else {
  initCommenter();
} 