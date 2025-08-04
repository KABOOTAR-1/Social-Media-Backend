const mongoose = require('mongoose');
crypto = require('crypto');

const AuthSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
});

AuthSchema.pre('save', function(next) {
    if (this.isModified('password')) { 
        this.password = hashPassword(this.password); 
    }
    next();
});

const generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
}

AuthSchema.methods.comparePassword = function(candidatePassword) {
    return comparePassword(candidatePassword, this.password);
}

AuthSchema.methods.generateEmailVerificationToken = function() {
    this.emailVerificationToken = generateToken();
    return this.emailVerificationToken;
}

AuthSchema.method.generatePasswordResetToken = function() {
    this.passwordResetToken = generateToken();
    this.passwordResetExpires = Date.now() + 3600000; 
    return this.passwordResetToken;
}

const Auth = mongoose.model('Auth', AuthSchema);
module.exports = Auth;