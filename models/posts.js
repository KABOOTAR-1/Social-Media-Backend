const mongoose= require('mongoose');

const PostSchema = new mongoose.Schema({
    postId: { type: String, required: true, unique: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    comments: { type: [mongoose.Schema.Types.ObjectId], ref: 'Comment', default: [] },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    status: { type: String, enum: ['public', 'private'], default: 'public' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;