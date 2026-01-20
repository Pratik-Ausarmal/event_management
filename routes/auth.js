// routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { requireAuth, setUserLocals } = require('../middleware/authMiddleware');

module.exports = (db) => {
    const authController = new AuthController(db);
    
    // Apply middleware
    router.use(setUserLocals);
    
    // Login routes
    router.get('/login', (req, res) => {
        if (req.session.user) {
            return res.redirect('/dashboard');
        }
        res.render('pages/login', { 
            error: null,
            success: null,
            currentPage: 'login'
        });
    });
    
    router.post('/login', (req, res) => authController.login(req, res));
    
    // Register routes
    router.get('/register', (req, res) => {
        if (req.session.user) {
            return res.redirect('/dashboard');
        }
        res.render('pages/register', { 
            error: null,
            currentPage: 'register'
        });
    });
    
    router.post('/register', (req, res) => authController.register(req, res));
    
    // OTP Verification routes
    router.get('/verify-otp', (req, res) => {
        res.render('pages/verify-otp', {
            error: null,
            email: '',
            type: 'registration',
            currentPage: 'verify-otp'
        });
    });
    
    router.post('/verify-otp-registration', (req, res) => authController.verifyRegistrationOTP(req, res));
    router.post('/verify-otp-reset', (req, res) => authController.verifyResetOTP(req, res));
    router.post('/resend-otp', (req, res) => authController.resendOTP(req, res));
    
    // Forgot password routes
    router.get('/forgot-password', (req, res) => {
        res.render('pages/forgot-password', {
            error: null,
            message: null,
            currentPage: 'forgot-password'
        });
    });
    
    router.post('/forgot-password', (req, res) => authController.forgotPassword(req, res));
    
    // Reset password routes
    router.get('/reset-password', (req, res) => {
        if (!req.session.resetEmail) {
            return res.redirect('/auth/forgot-password');
        }
        res.render('pages/reset-password', {
            email: req.session.resetEmail,
            error: null,
            currentPage: 'reset-password'
        });
    });
    
    router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
    
    // Logout
    router.get('/logout', (req, res) => authController.logout(req, res));
    
    // Profile routes (protected)
    router.get('/profile', requireAuth, (req, res) => authController.getProfile(req, res));
    router.post('/profile', requireAuth, (req, res) => authController.updateProfile(req, res));
    
    return router;
};