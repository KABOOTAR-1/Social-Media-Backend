const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    commentId: { type: String, required: true, unique: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    replies: { type: [mongoose.Schema.Types.ObjectId], ref: 'Comment', default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;