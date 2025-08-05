const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Auth = require('../models/auth');
const User = require('../models/users');
const Blacklist = require('../models/blacklist');
const sendMail = require('../utils/sendMail');
const httpStatus = require('http-status');
const { stat } = require('fs');

// Token creation utility
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secretKey', {
        expiresIn: '1h',
    });
};

// Login controller
const login = async (req, res) => {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
        return res.status(400).send('Email or username and password are required');
    }

    const auth = await Auth.findOne({ $or: [{ username }, { email }] });
    if (!auth) return res.status(404).send('User not found');

    const isPasswordValid = await auth.comparePassword(password);
    if (!isPasswordValid) return res.status(401).send('Invalid password');

    const currentUser = await User.findOne({ userInfo: auth._id }).populate('userInfo');
    const token = createToken(auth._id);

    res.cookie('token', token, {
        maxAge: 20 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    });

    res.status(200).json({ status: 'Success', data: currentUser });
};

// Register controller
const register = async (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
        return res.status(400).send('Username and password are required');
    }

    const existingUser = await Auth.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    try {
        const newAuth = await Auth.create({ ...req.body });
        const newUser = await User.create({ userInfo: newAuth._id });
        await newUser.save();

        res.status(201).send({ status: 'true', data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: 'false', message: `Error creating user: ${err.message}` });
    }
};

// Logout controller
const logout = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('No token provided');

    const isBlacklisted = await Blacklist.isBlacklisted(token);
    if (isBlacklisted) return res.sendStatus(204);

    try {
        await Blacklist.create({ token });
        res.clearCookie('token');
        res.status(200).send('Logged out successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging out');
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send('Email is required');

    const auth = await Auth.findOne({ email });
    if (!auth) return res.status(404).send('User not found');
    if (!auth.emailVerified) return res.status(400).send('Email not verified');

    const resetToken = auth.generatePasswordResetToken();
    auth.passwordResetExpires = Date.now() + 3600000;
    auth.passwordResetToken = resetToken;
    await auth.save();

    //Change the url later to use your frontend URL right now just testing through postman
    const url = `${req.protocol}://${req.get('host')}/auth/password/reset/${resetToken}`;
    const message = `Copy-paste this link in your browser:\n\n${url}`;

    try {
        await sendMail({
            to: auth.email,
            subject: 'Password reset',
            html: message,
        });

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            info: 'Check your email to reset your password',
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending email');
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).send('New password is required');

    const auth = await Auth.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!auth) return res.status(400).send('Invalid or expired token');

    auth.password = newPassword;
    auth.passwordResetToken = null;
    auth.passwordResetExpires = null;
    await auth.save();

    res.status(200).send('Password reset successfully');
};

// Send Verification Email
const sendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    const auth = await Auth.findOne({ email });
    if (!auth) return res.status(404).json({ success: false, message: 'User not found' });

    const rawToken = auth.generateEmailVerificationToken();
    await auth.save({ validateBeforeSave: false });

    const verificationUrl = `${req.protocol}://${req.get('host')}/auth/verify-email/${rawToken}`;
    const message = `Verify your email by clicking this link:\n\n${verificationUrl}`;

    try {
        await sendMail({
            to: auth.email,
            subject: 'Email Verification',
            html: message,
        });

        res.status(200).json({
            success: true,
            message: 'Verification email sent',
            info: 'Check your inbox to verify your email address',
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Could not send verification email' });
    }
};

// Verify Email
const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        const auth = await Auth.findOne({ emailVerificationToken: token });
        if (!auth) {
            return res.status(400).json({ status: false, message: 'Invalid or expired verification token' });
        }

        auth.emailVerificationToken = undefined;
        auth.emailVerified = true;
        await auth.save({ validateBeforeSave: false });

        const newToken = createToken(auth._id);

        res.status(200).cookie('token', newToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        }).json({
            status: true,
            message: 'Email verified successfully',
            token: newToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};

// Update Email or Username
const updateProfile = async (req, res) => {
    const { newEmail, newUsername } = req.body;

    const auth = req.user;
    if (newEmail) {
        auth.email = newEmail;
        auth.emailVerified = false;
        auth.generateEmailVerificationToken();
    }

    if (newUsername) {
        const exists = await Auth.findOne({ username: newUsername });
        if (exists && exists._id.toString() !== auth._id.toString()) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        auth.username = newUsername;
    }
  try {
        await auth.save();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Error updating profile' });
    }

    res.status(200).json({
        status: 'Success',
        message: 'Profile updated. Please verify your email if it was changed.',
        data: auth,
    });
};

module.exports = {
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
    updateProfile,
};
