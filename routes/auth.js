const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const validate = require('../middleware/validate');

// Auth routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.get('/password/reset/:token', authController.resetPassword);

// Email verification routes
router.post('/send-verification-email', authController.sendVerificationEmail);
router.get('/verify-email/:token', authController.verifyEmail);

// Profile update route (requires authentication middleware in production)
router.put('/update-profile', validate,authController.updateProfile);

module.exports = router;