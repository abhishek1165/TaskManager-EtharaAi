// authController.js — handles register, login, profile, password change
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const path = require('path');
const fs = require('fs');

// ─── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(ApiError.conflict('Email is already registered'));
  }

  // Create user (password hashed in pre-save hook)
  const user = await User.create({
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'member', // Only allow explicit admin assignment
  });

  const token = generateToken(user._id, user.role);

  return ApiResponse.created(res, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.getAvatarUrl(),
      createdAt: user.createdAt,
    },
    token,
  }, 'Account created successfully');
};

// ─── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Include password field explicitly (it's selected: false)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(ApiError.unauthorized('Invalid email or password'));
  }

  if (!user.isActive) {
    return next(ApiError.unauthorized('Account has been deactivated. Contact admin.'));
  }

  // Update lastLogin
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id, user.role);

  return ApiResponse.success(res, {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.getAvatarUrl(),
      bio: user.bio,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    token,
  }, 'Logged in successfully');
};

// ─── Get Current User ──────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const user = req.user;
  return ApiResponse.success(res, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.getAvatarUrl(),
    bio: user.bio,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  });
};

// ─── Update Profile ────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return next(ApiError.notFound('User not found'));

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  // Handle avatar upload
  if (req.file) {
    // Remove old avatar file if it exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, '../uploads/avatars', user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.avatar = req.file.filename;
  }

  await user.save();

  return ApiResponse.success(res, {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.getAvatarUrl(),
    bio: user.bio,
  }, 'Profile updated successfully');
};

// ─── Change Password ───────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(ApiError.notFound('User not found'));

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(ApiError.badRequest('Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id, user.role);

  return ApiResponse.success(res, { token }, 'Password changed successfully');
};

module.exports = { register, login, getMe, updateProfile, changePassword };
