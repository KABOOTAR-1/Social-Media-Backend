const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const AuthSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
});

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

AuthSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
    next();
});

const generateToken = function () {
    return crypto.randomBytes(32).toString('hex');
}

AuthSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

AuthSchema.methods.generateEmailVerificationToken = function () {
    this.emailVerificationToken = generateToken();
    return this.emailVerificationToken;
}

AuthSchema.methods.generatePasswordResetToken = function () {
    this.passwordResetToken = generateToken();
    this.passwordResetExpires = Date.now() + 3600000;
    return this.passwordResetToken;
}

const Auth = mongoose.model('Auth', AuthSchema);
module.exports = Auth;