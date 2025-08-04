const express=require('express');
const router=express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./user');
const postRoutes = require('./posts');
const commentRoutes = require('./comment');


router.use('/users', userRoutes).use('/auth', authRoutes)
    .use('/posts', postRoutes).use('/comments', commentRoutes);

module.exports = router;