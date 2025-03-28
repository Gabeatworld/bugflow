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
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  indicator.textContent = 'Loading Comment System...';
  document.body.appendChild(indicator);
  return indicator;
}

// Load required dependencies with version pinning and retry logic
function loadScript(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const tryLoad = (attemptsLeft) => {
      console.log(`Loading script (${retries - attemptsLeft + 1}/${retries} attempts): ${url}`);
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.type = 'text/javascript'; // Explicitly set script type
      
      // Add cache control headers
      script.setAttribute('cache-control', 'public, max-age=3600');
      
      script.onload = () => {
        console.log(`Script loaded successfully: ${url}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.error(`Script failed to load (attempt ${retries - attemptsLeft + 1}/${retries}): ${url}`, error);
        if (attemptsLeft > 1) {
          console.log(`Retrying in 1 second...`);
          setTimeout(() => tryLoad(attemptsLeft - 1), 1000);
        } else {
          reject(new Error(`Failed to load script after ${retries} attempts: ${url}`));
        }
      };
      
      document.head.appendChild(script);
    };
    
    tryLoad(retries);
  });
}

// Load required styles with version pinning
function loadStyles(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.crossOrigin = 'anonymous';
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
    
    // Load dependencies with specific versions
    await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
    await loadScript('https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio');
    
    // Load the commenter script from jsDelivr CDN with proper URL format
    console.log('Loading main commenter script...');
    const commenterUrl = 'https://cdn.jsdelivr.net/gh/Gabeatworld/bugflow@latest/public/commenter.js';
    await loadScript(commenterUrl);
    
    // Check if WebsiteCommenter is defined
    if (typeof WebsiteCommenter === 'undefined') {
      throw new Error(`WebsiteCommenter class not found after loading script from ${commenterUrl}`);
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
      const errorDetails = error.stack || error.message || error;
      console.error('Detailed error:', errorDetails);
      alert(`Failed to load commenting system: ${error.message || error}\n\nCheck console for details.`);
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