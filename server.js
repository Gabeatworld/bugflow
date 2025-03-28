const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*', // In production, replace with your website's domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/website-comments', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Comment Schema
const CommentSchema = new mongoose.Schema({
  comment: String,
  screenshot: String,
  position: { x: Number, y: Number },
  url: String,
  elementPath: String,
  userInfo: Object,
  consoleLogs: Array,
  timestamp: { type: Date, default: Date.now },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

const Comment = mongoose.model('Comment', CommentSchema);

// Get all comments for a URL
app.get('/api/comments', async (req, res) => {
  try {
    const { url } = req.query;
    const comments = await Comment.find({ url, parentId: null })
      .populate('replies')
      .sort({ timestamp: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new comment
app.post('/api/comment', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    await comment.save();
    
    // If this is a reply, update the parent comment
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(
        comment.parentId,
        { $push: { replies: comment._id } }
      );
    }
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reply to comment
app.post('/api/comment/:id/reply', async (req, res) => {
  try {
    const parentComment = await Comment.findById(req.params.id);
    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }
    
    const reply = new Comment({
      ...req.body,
      parentId: req.params.id,
      position: parentComment.position,
      elementPath: parentComment.elementPath,
      screenshot: parentComment.screenshot
    });
    
    await reply.save();
    await Comment.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply._id } }
    );
    
    res.json({ success: true, comment: reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update comment
app.put('/api/comment/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, timestamp: new Date() },
      { new: true }
    );
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete comment
app.delete('/api/comment/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // If this is a reply, remove it from parent's replies
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(
        comment.parentId,
        { $pull: { replies: comment._id } }
      );
    }
    
    // Delete all replies recursively
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ parentId: comment._id });
    }
    
    await comment.remove();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the commenter script
app.get('/commenter.js', (req, res) => {
  res.sendFile(__dirname + '/public/commenter.js');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
}); 