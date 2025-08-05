const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userInfo: {type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    bio: { type: String, default: '' },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref:'User', default: [] },
    following: { type: [mongoose.Schema.Types.ObjectId], ref:'User', default: [] },
    posts: { type: [mongoose.Schema.Types.ObjectId], ref:'Post', default: [] },
    blockedUsers: { type: [mongoose.Schema.Types.ObjectId], ref:'User', default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;