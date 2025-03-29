// Debug: Log immediately when script starts
console.log('🔄 Commenter loader script starting...', { timestamp: new Date().toISOString() });

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
    transition: background-color 0.3s ease;
  `;
  indicator.textContent = 'Loading Comment System...';
  document.body.appendChild(indicator);
  return indicator;
}

// Load required dependencies with version pinning and retry logic
function loadScript(url, { retries = 3, timeout = 5000, skipCORS = false } = {}) {
  return new Promise((resolve, reject) => {
    const tryLoad = (attemptsLeft) => {
      console.log(`Loading script (${retries - attemptsLeft + 1}/${retries} attempts): ${url}`);
      
      // Create script element
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      // Only add crossOrigin if not skipping CORS
      if (!skipCORS) {
        script.crossOrigin = 'anonymous';
      }
      
      script.type = 'text/javascript';
      
      // Force cache headers
      const urlWithCache = url.includes('?') ? 
        `${url}&_cache=${Date.now()}` : 
        `${url}?_cache=${Date.now()}`;
      script.src = urlWithCache;
      
      // Set up timeout
      const timeoutId = setTimeout(() => {
        console.error(`Script load timed out after ${timeout}ms: ${url}`);
        cleanup();
        if (attemptsLeft > 1) {
          console.log(`Retrying in 1 second...`);
          setTimeout(() => tryLoad(attemptsLeft - 1), 1000);
        } else {
          reject(new Error(`Script load timed out after ${retries} attempts: ${url}`));
        }
      }, timeout);
      
      // Setup success handler
      script.onload = () => {
        console.log(`Script loaded successfully: ${url}`);
        cleanup();
        
        // Verify script loaded properly
        setTimeout(() => {
          if (url.includes('commenter.js') && typeof WebsiteCommenter === 'undefined') {
            console.error(`Script loaded but WebsiteCommenter is not defined: ${url}`);
            if (attemptsLeft > 1) {
              console.log(`Retrying in 1 second...`);
              setTimeout(() => tryLoad(attemptsLeft - 1), 1000);
            } else {
              reject(new Error(`WebsiteCommenter not found after ${retries} attempts`));
            }
            return;
          }
          resolve();
        }, 100);
      };
      
      // Setup error handler
      script.onerror = (error) => {
        console.error(`Script failed to load (attempt ${retries - attemptsLeft + 1}/${retries}): ${url}`, error);
        cleanup();
        if (attemptsLeft > 1) {
          console.log(`Retrying in 1 second...`);
          setTimeout(() => tryLoad(attemptsLeft - 1), 1000);
        } else {
          reject(new Error(`Failed to load script after ${retries} attempts: ${url}`));
        }
      };
      
      // Cleanup function
      const cleanup = () => {
        clearTimeout(timeoutId);
        script.onload = null;
        script.onerror = null;
      };
      
      // Append script to document
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
  const startTime = performance.now();
  
  try {
    console.log('Starting to load dependencies...', { timestamp: new Date().toISOString() });
    
    // Load dependencies with specific versions
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    
    // Load Tailwind from CDN with CORS disabled
    await loadScript('https://cdn.tailwindcss.com', { skipCORS: true });
    
    // Load the commenter script from jsDelivr CDN with proper URL format
    console.log('Loading main commenter script...', { timestamp: new Date().toISOString() });
    const commenterUrl = 'https://cdn.jsdelivr.net/gh/Gabeatworld/bugflow@latest/public/commenter.js';
    await loadScript(commenterUrl, { retries: 3, timeout: 10000 });
    
    // Double check WebsiteCommenter is defined
    if (typeof WebsiteCommenter === 'undefined') {
      throw new Error(`WebsiteCommenter class not found after loading script from ${commenterUrl}`);
    }
    
    // Initialize the commenter
    console.log('Creating WebsiteCommenter instance...', { timestamp: new Date().toISOString() });
    const commenter = new WebsiteCommenter();
    
    // Verify initialization
    if (!commenter) {
      throw new Error('WebsiteCommenter instance creation failed');
    }
    
    // Calculate total load time
    const loadTime = performance.now() - startTime;
    console.log('Comment system initialized successfully', { 
      loadTimeMs: loadTime,
      timestamp: new Date().toISOString() 
    });
    
    // Update loading indicator
    loadingIndicator.textContent = 'Comment System Ready!';
    loadingIndicator.style.background = '#2196F3';
    
    // Remove indicator after 3 seconds
    setTimeout(() => {
      loadingIndicator.remove();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to load commenting system:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    loadingIndicator.textContent = 'Failed to load Comment System';
    loadingIndicator.style.background = '#f44336';
    loadingIndicator.style.cursor = 'pointer';
    loadingIndicator.onclick = () => {
      const errorDetails = error.stack || error.message || error;
      console.error('Detailed error:', {
        error: errorDetails,
        timestamp: new Date().toISOString()
      });
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