const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true }
}, { timestamps: true });

BlacklistSchema.statics.isBlacklisted = async function(token) {
  return await this.exists({ token });
};

const Blacklist = mongoose.model('Blacklist', BlacklistSchema);
module.exports = Blacklist;