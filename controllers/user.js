const { request } = require('express');
const Auth = require('../models/auth');
const User = require('../models/users');
const Post = require('../models/posts');

const getuser = async (req, res) => {
    try {
        const username = req.params.id;
        const auth = await Auth.findOne({ username: username }).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

        if (!auth) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const user = await User.findOne({ userInfo: auth._id })
            .populate('followers', 'username')
            .populate('following', 'username')
            .populate('posts', 'title content createdAt comments likes author');

        res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: `Server error ${error.message}` });
    }
}

const userFollowers = async (req, res) => {
    try {
        const username = req.params.id;
        const auth = await Auth.findOne({ username: username });
        if (!auth) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const user = await User.aggregate([
            {
                $match: { userInfo: auth._id }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'followers',
                    foreignField: '_id',
                    as: 'followerUsers'
                }
            },
            {
                $project: {
                    followerUsers: 1,
                }
            },
            {
                $unwind: '$followerUsers'
            },
            {
                $lookup: {
                    from: 'auths',
                    localField: 'followerUsers.userInfo',
                    foreignField: '_id',
                    as: 'followerUserInfo'
                }
            },
            {
                $project:{
                    followerUserInfo: 1,
                }
            },
            {
                $unwind: '$followerUserInfo'
            },
            {
                $project: {
                    _id: 0,
                    username: '$followerUserInfo.username'
                }
            }
        ]);

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const userFollowing = async (req, res) => {
    try {
        const username = req.params.id;
        const auth = await Auth.findOne({ username: username });
        if (!auth) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const user = await User.aggregate([
            {
                $match:{userInfo: auth._id}
            },
            {
                $lookup:{
                    from: 'users',
                    localField: 'following',
                    foreignField: '_id',
                    as: 'following'
                }
            },
            {
                $project: {
                    following: {
                        userInfo: 1,
                    }
                }
            },
            {
                $unwind: '$following'
            },
            {
                $lookup: {
                    from: 'auths',
                    localField: 'following.userInfo',
                    foreignField: '_id',
                    as: 'followingUserInfo'
                }
            },
            {
                $project: {
                    followingUserInfo: 1,
                }
            },
            {
                $unwind: '$followingUserInfo'
            },
            {
                $project: {
                    _id: 0,
                    username: '$followingUserInfo.username',
                    bio: '$following.bio'
                }
            }
        ])

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

//Later add for image as well
const updateUser = async (req, res) => {
    try {

        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        const { bio } = req.body;
        if (!bio) {
            return res.status(400).json({ status: false, message: 'Bio is required' });
        }
        user.bio = bio;
        user.updatedAt = Date.now();
        await user.save();

        res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const user = request.user;
        await User.deleteOne({ userInfo: user._id });
        await Auth.deleteOne({ _id: user._id });
        res.status(200).json({ status: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

const toggleFollow = async (req, res) => {
    try {
        const targetUsername = req.params.username;

        const targetAuth = await Auth.findOne({ username: targetUsername });
        if (!targetAuth) {
            return res.status(404).json({ status: false, message: 'Target user not found' });
        }

        const targetUser = await User.findOne({ userInfo: targetAuth._id });
        if (!targetUser) {
            return res.status(404).json({ status: false, message: 'Target user not found' });
        }

        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const isFollowing = user.following.includes(targetUser._id);
        if (isFollowing) {
            user.following.pull(targetUser._id);
            targetUser.followers.pull(req.user._id);
        } else {
            user.following.push(targetUser._id);
            targetUser.followers.push(req.user._id);
        }
        await user.save();
        await targetUser.save();
        res.status(200).json({ status: true, data: { userFollowing: user.following, targetFollowers: targetUser.followers } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
}

module.exports = {
    getuser,
    userFollowers,
    userFollowing,
    updateUser,
    deleteUser,
    toggleFollow
};

