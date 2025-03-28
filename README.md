# Website Commenting System

A lightweight commenting system that can be added to any website. Features include:
- Click anywhere to add comments
- Automatic screenshots
- Element highlighting
- Console log capture
- User information collection
- Threaded comments
- Modern UI with glassmorphism effects

## Quick Start

1. Add the following script to your website's HTML, just before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/gh/Gabeatworld/bugflow@main/public/commenter-loader.js"></script>
```

2. Start the server:
```bash
npm install
node server.js
```

3. Update the MongoDB connection URL in `server.js` if needed.

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Open `http://localhost:3000` in your browser

## Features

- **Easy Integration**: Just add one script tag to your website
- **Visual Comments**: Click anywhere to add a comment with automatic screenshots
- **Element Tracking**: Comments are tied to specific elements on the page
- **User Information**: Automatically captures browser and system information
- **Console Logs**: Captures relevant console logs for debugging
- **Threaded Comments**: Support for nested replies
- **Modern UI**: Glassmorphism effects and smooth animations
- **Keyboard Shortcuts**: Quick actions for common operations

## API Endpoints

- `GET /api/comments?url=<page_url>`: Get all comments for a URL
- `POST /api/comment`: Create a new comment
- `POST /api/comment/:id/reply`: Add a reply to a comment
- `PUT /api/comment/:id`: Update a comment
- `DELETE /api/comment/:id`: Delete a comment and its replies

## License

MIT 