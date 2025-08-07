const mongoose= require('mongoose');
const User = require("./users");
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

PostSchema.post('save', async function(doc) {
    try {
        await User.findByIdAndUpdate(doc.author, {
            $addToSet: { posts: doc._id }
        });
    } catch (err) {
        console.error('Error adding post to user:', err);
    }
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;