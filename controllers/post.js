const Post = require('../models/posts');
const User = require('../models/users');
const Auth = require('../models/auth');
const mongoose = require('mongoose');

const getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        console.log(`Fetching post with ID: ${postId}`);
        const post = await Post.findOne({ postId: postId }).select("title content image author postId").populate({
            path: 'author',
            select: 'userInfo -_id',
            populate: {
                path: 'userInfo',
                select: 'username profilePicture -_id'
            }
        }).lean();
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }

        res.status(200).json({ status: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const createPost = async (req, res) => {
    try {
        const { title, content, image } = req.body;
        if (!title || !content) {
            return res.status(400).json({ status: false, message: 'Title and content are required' });
        }
        const newPost = new Post({
            postId: new mongoose.Types.ObjectId().toString(),
            title: title,
            content: content,
        });
        if (image) {
            newPost.image = image;
        }
        newPost.author = req.user._id;
        await newPost.save();
        // req.user.posts.push(newPost._id);
        // await req.user.save();
        res.status(201).json({ status: true, data: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, image } = req.body;

        const post = await Post.findOne({ postId: postId }).select("title content image author postId");
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }
        if (req.user._id.toString() !== post.author.toString()) {
            return res.status(403).json({ status: false, message: 'You are not authorized to update this post' });
        }

        if (title) post.title = title;
        if (content) post.content = content;
        if (image) post.image = image;

        post.updatedAt = Date.now();
        await post.save();

        res.status(200).json({ status: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }
        await post.remove();
        res.status(200).json({ status: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const toogleLikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findOne({ postId: postId }).select(" likes author postId ");
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }

        const userId = req.user._id;
        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();

        res.status(200).json({ status: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const getUserPosts = async (req, res) => {
    try {
        const username = req.params.userId;
        const auth = await Auth.findOne({ username: username });
        const user = await User.findOne({ userInfo: auth._id })
            .select("-_id posts")
            .populate({
                path: "posts",
                select: "-_id", 
            });


        console.log(`Fetching posts for user ID: ${user}`);

        res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const changeStatus = async (req, res) => {
    try {
        const postId = req.params.id;
        const { status } = req.body;

        if (!['public', 'private'].includes(status)) {
            return res.status(400).json({ status: false, message: 'Invalid status' });
        }

        const post = await Post.findOne({postId:postId}).select("status postId author updatedAt");
        if (!post) {
            return res.status(404).json({ status: false, message: 'Post not found' });
        }

        post.status = status;
        post.updatedAt = Date.now();
        await post.save();

        res.status(200).json({ status: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

module.exports = {
    getPost,
    createPost,
    updatePost,
    deletePost,
    toogleLikePost,
    getUserPosts,
    changeStatus
};
