const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

// Register
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
