class WebsiteCommenter {
  constructor() {
    this.isActive = true;
    this.comments = [];
    this.highlightedElement = null;
    this.activeCommentViewer = null;
    this.commentCounter = 1;
    this.previewPin = null;
    this.isAddingComment = false;
    this.selectedElement = null;
    this.selectedPosition = null;
    this.init();
    this.loadComments();
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      
      // Escape to cancel comment mode or close any open windows
      if (e.key === 'Escape') {
        if (this.isAddingComment) {
          this.isAddingComment = false;
          if (this.previewPin) {
            this.previewPin.remove();
            this.previewPin = null;
          }
          if (this.highlightedElement) {
            this.highlightedElement.classList.remove('highlighted-element');
            this.highlightedElement = null;
          }
        } else if (this.activeCommentViewer) {
          this.activeCommentViewer.remove();
          this.activeCommentViewer = null;
        } else if (document.querySelector('.comment-form')) {
          document.querySelector('.comment-form').remove();
        } else if (document.querySelector('.comments-list')) {
          document.querySelector('.comments-list').remove();
        }
      }
      
      // Enter to submit comment form
      if (e.key === 'Enter' && !e.shiftKey && document.querySelector('.comment-form')) {
        e.preventDefault();
        document.querySelector('.comment-form button[type="submit"]').click();
      }
    });
  }

  init() {
    // Add Tailwind CSS for modern UI
    const tailwindLink = document.createElement('link');
    tailwindLink.rel = 'stylesheet';
    tailwindLink.href = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindLink);

    const style = document.createElement('style');
    style.textContent = `
      .comment-pin {
        position: absolute;
        width: 20px;
        height: 20px;
        background: #ff4444;
        border-radius: 50%;
        cursor: pointer;
        z-index: 999999;
        transition: transform 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        pointer-events: none;
      }
      .comment-pin:hover {
        transform: scale(1.2);
      }
      .comment-pin.active {
        background: #28a745;
        transform: scale(1.2);
      }
      .comment-pin.preview {
        background: rgba(255, 68, 68, 0.5);
        transform: scale(0.8);
        pointer-events: none;
        border: 2px dashed #ff4444;
      }
      .comment-form {
        position: fixed;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.15);
        z-index: 1000000;
        max-width: 500px;
        width: 90%;
        transform: translate(20px, 20px);
        pointer-events: auto;
        margin: 20px;
      }
      .comment-form textarea {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
        background: rgba(255, 255, 255, 0.9);
      }
      .comment-form textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
      .comment-form .shortcuts {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
      }
      .comment-form .shortcuts span {
        background: rgba(248, 249, 250, 0.9);
        padding: 2px 4px;
        border-radius: 3px;
        margin: 0 2px;
      }
      .comment-form button {
        padding: 8px 16px;
        margin: 0 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.9);
      }
      .comment-form button[type="submit"] {
        background: #007bff;
        color: white;
      }
      .comment-form button.cancel {
        background: #dc3545;
        color: white;
      }
      .comment-buttons {
        position: fixed;
        top: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 999999;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .comment-button {
        padding: 10px 20px;
        background: rgba(0, 123, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: transform 0.2s;
        pointer-events: auto;
      }
      .comment-button:hover {
        transform: scale(1.05);
      }
      .comment-button.active {
        background: #0056b3;
        transform: scale(1.05);
      }
      .highlighted-element {
        outline: 2px solid #007bff !important;
        outline-offset: 2px;
        transition: all 0.2s ease;
        position: relative;
        z-index: 999998;
      }
      .highlighted-element::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: rgba(0, 123, 255, 0.1);
        pointer-events: none;
        z-index: 999998;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { opacity: 0.5; }
        50% { opacity: 0.8; }
        100% { opacity: 0.5; }
      }
      .comment-viewer {
        position: fixed;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        z-index: 1000000;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin: 20px;
      }
      .comment-viewer img {
        max-width: 100%;
        border-radius: 4px;
        margin: 10px 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        cursor: pointer;
      }
      .comment-viewer .close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 20px;
        color: #666;
      }
      .comment-viewer pre {
        background: rgba(248, 249, 250, 0.9);
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
      }
      .comment-viewer .timestamp {
        color: #666;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .comment-viewer .user-info {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        background: rgba(248, 249, 250, 0.8);
        padding: 12px;
        border-radius: 8px;
        margin: 10px 0;
        font-size: 12px;
      }
      .comment-viewer .user-info-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }
      .comment-viewer .user-info-item label {
        color: #666;
        margin: 0;
      }
      .comment-viewer .user-info-item value {
        color: #333;
        margin: 0;
      }
      .comment-viewer .console-logs {
        background: rgba(248, 249, 250, 0.9);
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
      }
      .comment-viewer .console-log {
        padding: 5px;
        border-bottom: 1px solid #ddd;
      }
      .comment-viewer .console-log:last-child {
        border-bottom: none;
      }
      .comment-viewer .console-log.error {
        color: #dc3545;
      }
      .comment-viewer .console-log.warn {
        color: #ffc107;
      }
      .comment-viewer .console-log.info {
        color: #17a2b8;
      }
      .comment-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      .comment-actions button {
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.9);
      }
      .comment-actions .edit {
        background: #ffc107;
        color: #000;
      }
      .comment-actions .delete {
        background: #dc3545;
        color: white;
      }
      .comments-list {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 20px;
        box-shadow: 2px 0 20px rgba(0,0,0,0.1);
        z-index: 1000000;
        overflow-y: auto;
        transform: translateX(-100%);
        transition: transform 0.3s ease-out;
      }
      .comments-list.open {
        transform: translateX(0);
      }
      .comments-list .close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 20px;
        color: #666;
      }
      .comment-item {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        margin-bottom: 10px;
      }
      .comment-item:hover {
        background: rgba(248, 249, 250, 0.9);
      }
      .comment-item .preview {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .comment-item .preview img {
        width: 100px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
      }
      .comment-item .preview .text {
        flex: 1;
      }
      .comment-item .preview .text h4 {
        margin: 0 0 5px 0;
        color: #007bff;
      }
      .comment-item .preview .text p {
        margin: 0;
        font-size: 14px;
        color: #666;
      }
      .info-button {
        padding: 10px 20px;
        background: rgba(108, 117, 125, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: transform 0.2s;
        pointer-events: auto;
      }
      .info-button:hover {
        transform: scale(1.05);
      }
      .info-modal {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        padding: 20px;
        box-shadow: 2px 0 20px rgba(0,0,0,0.1);
        z-index: 1000000;
        transform: translateX(-100%);
        transition: transform 0.3s ease-out;
      }
      .info-modal.open {
        transform: translateX(0);
      }
      .info-modal h3 {
        margin-top: 0;
        color: #007bff;
      }
      .info-modal .shortcut {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        border-bottom: 1px solid #eee;
      }
      .info-modal .shortcut:last-child {
        border-bottom: none;
      }
      .info-modal .shortcut .key {
        background: rgba(248, 249, 250, 0.9);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
      }
      .screenshot-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        cursor: pointer;
      }
      .screenshot-modal img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
      }
      .screenshot-modal .close {
        position: absolute;
        top: 20px;
        right: 20px;
        color: white;
        font-size: 30px;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.5);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000002;
      }
      .reply-form {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
      .reply-form textarea {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
        background: rgba(255, 255, 255, 0.9);
      }
      .reply-form textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
      }
      .reply-form button {
        padding: 8px 16px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .reply-form button:hover {
        background: #0056b3;
      }
    `;
    document.head.appendChild(style);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'comment-buttons';

    const addButton = document.createElement('button');
    addButton.className = 'comment-button';
    addButton.textContent = 'Add Comment';

    const listButton = document.createElement('button');
    listButton.className = 'comment-button';
    listButton.textContent = 'View Comments';
    listButton.addEventListener('click', () => this.showCommentsList());

    const infoButton = document.createElement('button');
    infoButton.className = 'info-button';
    infoButton.textContent = 'Info';
    infoButton.addEventListener('click', () => this.showInfo());

    buttonsContainer.appendChild(addButton);
    buttonsContainer.appendChild(listButton);
    buttonsContainer.appendChild(infoButton);
    document.body.appendChild(buttonsContainer);

    this.setupEventListeners();
    this.setupConsoleLogging();
  }

  setupConsoleLogging() {
    this.consoleLogs = [];
    const methods = ['log', 'error', 'warn', 'info'];
    methods.forEach(method => {
      const original = console[method];
      console[method] = (...args) => {
        this.consoleLogs.push({
          type: method,
          content: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
          timestamp: new Date().toISOString()
        });
        original.apply(console, args);
      };
    });
  }

  async loadComments() {
    try {
      const response = await fetch(`http://localhost:3000/api/comments?url=${encodeURIComponent(window.location.href)}`);
      this.comments = await response.json();
      this.renderExistingComments();
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  renderExistingComments() {
    this.comments.forEach(comment => {
      const pin = this.createCommentPin(comment.position.x, comment.position.y, comment);
    });
  }

  setupEventListeners() {
    // Mouse move handler for preview
    document.addEventListener('mousemove', (e) => {
      if (!this.isActive || !this.isAddingComment) return;
      
      // Don't highlight UI elements
      if (e.target.closest('.comment-buttons') || 
          e.target.closest('.comment-form') || 
          e.target.closest('.comment-viewer') || 
          e.target.closest('.comments-list') || 
          e.target.closest('.info-modal')) {
        return;
      }
      
      const element = e.target;
      if (element === this.selectedElement) return;
      
      const rect = element.getBoundingClientRect();
      const x = e.pageX;
      const y = e.pageY;
      
      // Create or update preview pin
      if (!this.previewPin) {
        this.previewPin = this.createCommentPin(x, y, null, true);
      } else {
        this.previewPin.style.left = `${x}px`;
        this.previewPin.style.top = `${y}px`;
      }
      
      // Update element highlight
      if (this.highlightedElement) {
        this.highlightedElement.classList.remove('highlighted-element');
      }
      element.classList.add('highlighted-element');
      this.highlightedElement = element;
      this.selectedElement = element;
      this.selectedPosition = { x, y };
    });

    // Click handler for adding comments
    document.addEventListener('click', async (e) => {
      if (!this.isActive || !this.isAddingComment) return;
      if (e.target.classList.contains('comment-button')) return;
      if (e.target.classList.contains('comment-pin')) return;
      if (e.target.closest('.comment-form')) return;
      if (e.target.closest('.comment-viewer')) return;
      if (e.target.closest('.comments-list')) return;
      if (e.target.closest('.info-modal')) return;
      
      e.preventDefault();
      const element = e.target;
      const rect = element.getBoundingClientRect();
      const x = e.pageX;
      const y = e.pageY;
      
      // Remove preview pin
      if (this.previewPin) {
        this.previewPin.remove();
        this.previewPin = null;
      }
      
      const elementPath = this.getElementPath(element);
      const form = this.createCommentForm(x, y, elementPath);
      document.body.appendChild(form);
    });

    // Start comment mode when clicking Add Comment button
    const addButton = document.querySelector('.comment-button');
    addButton.addEventListener('click', () => {
      this.isAddingComment = !this.isAddingComment;
      addButton.classList.toggle('active');
      
      if (this.isAddingComment) {
        // Create initial preview pin at current mouse position
        const event = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: 0,
          clientY: 0
        });
        document.dispatchEvent(event);
      } else {
        if (this.previewPin) {
          this.previewPin.remove();
          this.previewPin = null;
        }
        if (this.highlightedElement) {
          this.highlightedElement.classList.remove('highlighted-element');
          this.highlightedElement = null;
        }
      }
    });
  }

  getElementPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = element;
        let nth = 1;
        while (sibling.previousSibling) {
          sibling = sibling.previousSibling;
          if (sibling.nodeType === Node.ELEMENT_NODE && 
              sibling.nodeName === element.nodeName) {
            nth++;
          }
        }
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }

  createCommentForm(x, y, elementPath, existingComment = null, parentId = null) {
    if (this.activeCommentViewer) {
      this.activeCommentViewer.remove();
      this.activeCommentViewer = null;
    }
    const existingForm = document.querySelector('.comment-form');
    if (existingForm) {
      existingForm.remove();
    }

    const form = document.createElement('div');
    form.className = 'comment-form';
    form.style.left = `${x}px`;
    form.style.top = `${y}px`;
    form.innerHTML = `
      <textarea placeholder="Enter your comment" rows="4" cols="50">${existingComment ? existingComment.comment : ''}</textarea><br>
      <button type="submit">${existingComment ? 'Update' : 'Submit'}</button>
      <button type="button" class="cancel">Cancel</button>
      <div class="shortcuts">
        Press <span>Enter</span> to submit, <span>Shift+Enter</span> for new line, <span>Esc</span> to cancel
      </div>
    `;

    form.querySelector('button[type="submit"]').addEventListener('click', async () => {
      const comment = form.querySelector('textarea').value;
      if (!comment) return;

      const screenshot = await this.takeScreenshot();
      const userInfo = this.getUserInfo();
      
      const commentData = {
        comment,
        screenshot,
        position: { x, y },
        url: window.location.href,
        elementPath,
        userInfo,
        consoleLogs: this.consoleLogs,
        parentId
      };

      if (existingComment) {
        commentData._id = existingComment._id;
        await this.updateComment(commentData);
      } else if (parentId) {
        await this.addReply(parentId, commentData);
      } else {
        await this.saveComment(commentData);
      }
      
      form.remove();
      this.isAddingComment = false;
      if (this.highlightedElement) {
        this.highlightedElement.classList.remove('highlighted-element');
        this.highlightedElement = null;
      }
    });

    form.querySelector('.cancel').addEventListener('click', () => {
      form.remove();
      this.isAddingComment = false;
      if (this.highlightedElement) {
        this.highlightedElement.classList.remove('highlighted-element');
        this.highlightedElement = null;
      }
    });

    return form;
  }

  createCommentPin(x, y, commentData = null, isPreview = false) {
    const pin = document.createElement('div');
    pin.className = `comment-pin${isPreview ? ' preview' : ''}`;
    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;
    
    if (commentData) {
      pin.textContent = this.commentCounter++;
      pin.dataset.commentId = commentData._id;
      pin.addEventListener('click', () => this.showComment(commentData));
    }
    
    document.body.appendChild(pin);
    return pin;
  }

  showComment(comment) {
    // Close existing viewer if clicking on the same comment
    if (this.activeCommentViewer) {
      const currentCommentId = this.activeCommentViewer.dataset.commentId;
      if (currentCommentId === comment._id) {
        this.activeCommentViewer.remove();
        this.activeCommentViewer = null;
        return;
      }
      this.activeCommentViewer.remove();
      this.activeCommentViewer = null;
    }

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('highlighted-element');
    }
    if (comment.elementPath) {
      const element = document.querySelector(comment.elementPath);
      if (element) {
        element.classList.add('highlighted-element');
        this.highlightedElement = element;
      }
    }

    const viewer = document.createElement('div');
    viewer.className = 'comment-viewer';
    viewer.dataset.commentId = comment._id;
    
    // Position the viewer next to the comment pin
    const pin = document.querySelector(`.comment-pin[data-comment-id="${comment._id}"]`);
    if (pin) {
      const pinRect = pin.getBoundingClientRect();
      const viewerWidth = 500; // max-width of viewer
      const viewerHeight = Math.min(window.innerHeight * 0.9, 600); // max-height
      
      let left = pinRect.right + 20;
      let top = pinRect.top;
      
      // Adjust position if viewer would go off screen
      if (left + viewerWidth > window.innerWidth - 40) {
        left = pinRect.left - viewerWidth - 20;
      }
      if (top + viewerHeight > window.innerHeight - 40) {
        top = window.innerHeight - viewerHeight - 40;
      }
      
      viewer.style.left = `${left}px`;
      viewer.style.top = `${top}px`;
    }

    viewer.innerHTML = `
      <span class="close">&times;</span>
      <h3>Comment #${comment._id || this.comments.indexOf(comment) + 1}</h3>
      <div class="timestamp">${new Date(comment.timestamp).toLocaleString()}</div>
      <p>${comment.comment}</p>
      <img src="${comment.screenshot}" alt="Screenshot" onclick="this.showScreenshotModal(this.src)">
      <div class="user-info">
        <div class="user-info-item">
          <label>Browser:</label>
          <value>${comment.userInfo.browser || 'Unknown'}</value>
        </div>
        <div class="user-info-item">
          <label>Platform:</label>
          <value>${comment.userInfo.platform || 'Unknown'}</value>
        </div>
        <div class="user-info-item">
          <label>Screen:</label>
          <value>${comment.userInfo.screenResolution || 'Unknown'}</value>
        </div>
        <div class="user-info-item">
          <label>Viewport:</label>
          <value>${comment.userInfo.viewport || 'Unknown'}</value>
        </div>
        <div class="user-info-item">
          <label>Lang:</label>
          <value>${comment.userInfo.language || 'Unknown'}</value>
        </div>
      </div>
      <h4>Console Logs</h4>
      <div class="console-logs">
        ${comment.consoleLogs.map(log => `
          <div class="console-log ${log.type}">
            <strong>${log.type.toUpperCase()}:</strong> ${log.content}
          </div>
        `).join('')}
      </div>
      <div class="comment-actions">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
      <div class="replies-section">
        <h4>Replies</h4>
        <div class="replies-list">
          ${comment.replies ? comment.replies.map(reply => `
            <div class="reply-item">
              <div class="reply-content">
                <p>${reply.comment}</p>
                <small>${new Date(reply.timestamp).toLocaleString()}</small>
              </div>
              <div class="reply-actions">
                <button class="delete-reply" data-id="${reply._id}">Delete</button>
              </div>
            </div>
          `).join('') : ''}
        </div>
        <div class="reply-form">
          <textarea placeholder="Write a reply..." rows="3"></textarea>
          <button type="submit">Reply</button>
        </div>
      </div>
    `;

    // Add click outside handler
    const clickOutsideHandler = (e) => {
      if (!viewer.contains(e.target)) {
        viewer.remove();
        this.activeCommentViewer = null;
        if (this.highlightedElement) {
          this.highlightedElement.classList.remove('highlighted-element');
          this.highlightedElement = null;
        }
      }
    };

    // Add screenshot modal handler
    this.showScreenshotModal = (src) => {
      const modal = document.createElement('div');
      modal.className = 'screenshot-modal';
      modal.innerHTML = `
        <span class="close">&times;</span>
        <img src="${src}" alt="Full Screenshot">
      `;

      modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });

      document.body.appendChild(modal);
    };

    viewer.querySelector('.close').addEventListener('click', clickOutsideHandler);
    viewer.querySelector('.edit').addEventListener('click', () => {
      const form = this.createCommentForm(comment.position.x, comment.position.y, comment.elementPath, comment);
      viewer.remove();
      this.activeCommentViewer = null;
      document.body.appendChild(form);
    });

    viewer.querySelector('.delete').addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this comment and all its replies?')) {
        await this.deleteComment(comment);
        viewer.remove();
        this.activeCommentViewer = null;
        if (this.highlightedElement) {
          this.highlightedElement.classList.remove('highlighted-element');
          this.highlightedElement = null;
        }
      }
    });

    // Add reply form submit handler
    viewer.querySelector('.reply-form button').addEventListener('click', async () => {
      const replyText = viewer.querySelector('.reply-form textarea').value;
      if (!replyText) return;

      const replyData = {
        comment: replyText,
        screenshot: comment.screenshot,
        position: comment.position,
        url: window.location.href,
        elementPath: comment.elementPath,
        userInfo: this.getUserInfo(),
        consoleLogs: this.consoleLogs,
        parentId: comment._id
      };

      const result = await this.addReply(comment._id, replyData);
      if (result) {
        // Update the replies list immediately
        const repliesList = viewer.querySelector('.replies-list');
        const replyItem = document.createElement('div');
        replyItem.className = 'reply-item';
        replyItem.innerHTML = `
          <div class="reply-content">
            <p>${replyText}</p>
            <small>${new Date().toLocaleString()}</small>
          </div>
          <div class="reply-actions">
            <button class="delete-reply" data-id="${result.comment._id}">Delete</button>
          </div>
        `;
        repliesList.appendChild(replyItem);
        viewer.querySelector('.reply-form textarea').value = '';

        // Add delete handler for the new reply
        replyItem.querySelector('.delete-reply').addEventListener('click', async (e) => {
          const replyId = e.target.dataset.id;
          if (confirm('Are you sure you want to delete this reply?')) {
            await this.deleteComment({ _id: replyId });
            replyItem.remove();
          }
        });
      }
    });

    document.body.appendChild(viewer);
    this.activeCommentViewer = viewer;
  }

  showCommentsList() {
    // Exit comment mode if active
    if (this.isAddingComment) {
      this.isAddingComment = false;
      const addButton = document.querySelector('.comment-button');
      addButton.classList.remove('active');
      if (this.previewPin) {
        this.previewPin.remove();
        this.previewPin = null;
      }
      if (this.highlightedElement) {
        this.highlightedElement.classList.remove('highlighted-element');
        this.highlightedElement = null;
      }
    }

    // Toggle existing list if open
    const existingList = document.querySelector('.comments-list');
    if (existingList) {
      existingList.classList.toggle('open');
      return;
    }

    if (this.activeCommentViewer) {
      this.activeCommentViewer.remove();
      this.activeCommentViewer = null;
    }
    const existingForm = document.querySelector('.comment-form');
    if (existingForm) {
      existingForm.remove();
    }

    if (this.highlightedElement) {
      this.highlightedElement.classList.remove('highlighted-element');
      this.highlightedElement = null;
    }

    const list = document.createElement('div');
    list.className = 'comments-list';
    list.innerHTML = `
      <span class="close">&times;</span>
      <h3>Comments (${this.comments.length})</h3>
      ${this.comments.map(comment => `
        <div class="comment-item">
          <div class="preview">
            <img src="${comment.screenshot}" alt="Screenshot">
            <div class="text">
              <h4>Comment #${comment._id || this.comments.indexOf(comment) + 1}</h4>
              <p>${comment.comment.substring(0, 100)}${comment.comment.length > 100 ? '...' : ''}</p>
              <small>${new Date(comment.timestamp).toLocaleString()}</small>
            </div>
          </div>
        </div>
      `).join('')}
    `;

    list.querySelector('.close').addEventListener('click', () => {
      list.classList.remove('open');
    });

    list.querySelectorAll('.comment-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        list.classList.remove('open');
        this.showComment(this.comments[index]);
      });
    });

    document.body.appendChild(list);
    // Trigger reflow
    list.offsetHeight;
    list.classList.add('open');
  }

  getUserInfo() {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      browser: navigator.vendor,
      platform: navigator.platform,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
  }

  async takeScreenshot() {
    const canvas = await html2canvas(document.body);
    return canvas.toDataURL();
  }

  async saveComment(data) {
    try {
      const response = await fetch('http://localhost:3000/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      this.comments.push(result.comment);
      // Create pin immediately after saving
      this.createCommentPin(result.comment.position.x, result.comment.position.y, result.comment);
      return result;
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  }

  async updateComment(data) {
    try {
      const response = await fetch(`http://localhost:3000/api/comment/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      const index = this.comments.findIndex(c => c._id === data._id);
      if (index !== -1) {
        this.comments[index] = result.comment;
      }
      return result;
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }

  async deleteComment(comment) {
    try {
      const response = await fetch(`http://localhost:3000/api/comment/${comment._id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const index = this.comments.findIndex(c => c._id === comment._id);
        if (index !== -1) {
          this.comments.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  async addReply(parentId, commentData) {
    try {
      const response = await fetch(`http://localhost:3000/api/comment/${parentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });
      const result = await response.json();
      
      // Update the comments array immediately
      const parentComment = this.comments.find(c => c._id === parentId);
      if (parentComment) {
        parentComment.replies = parentComment.replies || [];
        parentComment.replies.push(result.comment);
      }
      
      return result;
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }

  showInfo() {
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
      <span class="close">&times;</span>
      <h3>Website Commenter Documentation</h3>
      <h4>Keyboard Shortcuts</h4>
      <div class="shortcut">
        <span>Add Comment Mode</span>
        <span class="key">Click Add Comment button</span>
      </div>
      <div class="shortcut">
        <span>Place Comment</span>
        <span class="key">Click on element</span>
      </div>
      <div class="shortcut">
        <span>Submit Comment</span>
        <span class="key">Enter</span>
      </div>
      <div class="shortcut">
        <span>New Line in Comment</span>
        <span class="key">Shift + Enter</span>
      </div>
      <div class="shortcut">
        <span>Cancel/Close</span>
        <span class="key">Esc</span>
      </div>
      <h4>Features</h4>
      <ul>
        <li>Click anywhere to add a comment</li>
        <li>Preview comment location before placing</li>
        <li>View all comments in a list</li>
        <li>Edit and delete comments</li>
        <li>Reply to existing comments</li>
        <li>Automatic screenshots and element tracking</li>
        <li>Console log capture</li>
        <li>User information collection</li>
      </ul>
    `;

    modal.querySelector('.close').addEventListener('click', () => {
      modal.classList.remove('open');
    });

    document.body.appendChild(modal);
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add('open');
  }
} 