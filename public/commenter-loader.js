// Load required dependencies
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
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
  try {
    // Load dependencies
    await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');
    await loadScript('https://cdn.tailwindcss.com');
    
    // Load the commenter script from GitHub
    await loadScript('https://raw.githubusercontent.com/YOUR_USERNAME/website-commenting/main/public/commenter.js');
    
    // Initialize the commenter
    new WebsiteCommenter();
  } catch (error) {
    console.error('Failed to load commenting system:', error);
  }
}

// Start loading when the page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCommenter);
} else {
  initCommenter();
} 