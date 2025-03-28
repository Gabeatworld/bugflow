// Immediate console log to verify script is running
console.log('🔄 Commenter loader script starting...');

// Get the current script's URL to determine the base path
const currentScript = document.currentScript;
const baseUrl = currentScript ? currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1) : '';

console.log('Base URL:', baseUrl);

// Create a visible indicator that the system is loading
function createLoadingIndicator() {
  console.log('Creating loading indicator...');
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
  console.log('Loading indicator created and added to page');
  return indicator;
}

// Load required dependencies
function loadScript(url) {
  console.log(`Starting to load script: ${url}`);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    script.onload = () => {
      console.log(`✅ Script loaded successfully: ${url}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`❌ Script failed to load: ${url}`, error);
      console.error('Error details:', {
        url: url,
        error: error,
        readyState: document.readyState,
        baseUrl: baseUrl
      });
      reject(error);
    };
    
    document.head.appendChild(script);
  });
}

// Load required styles
function loadStyles(url) {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to load styles: ${url}`);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      console.log(`✅ Successfully loaded styles: ${url}`);
      resolve();
    };
    link.onerror = (error) => {
      console.error(`❌ Failed to load styles: ${url}`, error);
      reject(error);
    };
    document.head.appendChild(link);
  });
}

// Initialize the commenter
async function initCommenter() {
  console.log('Starting commenter initialization...');
  const loadingIndicator = createLoadingIndicator();
  
  try {
    // Load dependencies
    console.log('Loading html2canvas...');
    await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');
    
    console.log('Loading Tailwind...');
    await loadScript('https://cdn.tailwindcss.com');
    
    // Load the commenter script using the full URL
    console.log('Loading main commenter script...');
    const commenterUrl = baseUrl + 'commenter.js';
    console.log('Commenter URL:', commenterUrl);
    
    try {
      await loadScript(commenterUrl);
    } catch (error) {
      console.log('Failed to load from base URL, trying alternative...');
      // Try alternative URL if base URL fails
      await loadScript('http://localhost:3000/commenter.js');
    }
    
    // Check if WebsiteCommenter is defined
    if (typeof WebsiteCommenter === 'undefined') {
      throw new Error('WebsiteCommenter class not found after loading script');
    }
    
    // Initialize the commenter
    console.log('Creating WebsiteCommenter instance...');
    const commenter = new WebsiteCommenter();
    console.log('WebsiteCommenter instance created successfully');
    
    // Update loading indicator
    loadingIndicator.textContent = 'Comment System Ready!';
    loadingIndicator.style.background = '#2196F3';
    
    // Remove indicator after 3 seconds
    setTimeout(() => {
      loadingIndicator.remove();
    }, 3000);
    
  } catch (error) {
    console.error('Failed to initialize commenter:', error);
    console.error('Full error details:', {
      error: error,
      message: error.message,
      stack: error.stack,
      baseUrl: baseUrl
    });
    
    loadingIndicator.textContent = 'Failed to load Comment System';
    loadingIndicator.style.background = '#f44336';
    loadingIndicator.style.cursor = 'pointer';
    loadingIndicator.onclick = () => {
      console.error('Error details:', error);
      alert('Failed to load commenting system. Check console for details.');
    };
  }
}

// Start loading immediately
console.log('Starting commenter initialization process...');
initCommenter().catch(error => {
  console.error('Fatal error in initialization:', error);
}); 