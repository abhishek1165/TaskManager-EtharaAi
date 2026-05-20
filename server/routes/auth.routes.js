const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');

// ─── Validation rules ──────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// ─── Routes ────────────────────────────────────────────────────────────────────
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.put('/change-password', verifyToken, changePasswordValidation, handleValidationErrors, changePassword);

module.exports = router;
