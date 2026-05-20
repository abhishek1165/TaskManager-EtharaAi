const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ─── Get All Users (Admin only) ────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  const usersWithAvatars = users.map((u) => ({
    ...u.toJSON(),
    avatar: u.getAvatarUrl(),
  }));

  return ApiResponse.paginated(res, usersWithAvatars, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
};

// ─── Get User by ID ────────────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(ApiError.notFound('User not found'));

  return ApiResponse.success(res, { ...user.toJSON(), avatar: user.getAvatarUrl() });
};

// ─── Update User Role (Admin only) ────────────────────────────────────────────
const updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  if (!['admin', 'member'].includes(role)) {
    return next(ApiError.badRequest('Role must be admin or member'));
  }

  // Prevent self-demotion
  if (req.params.id === req.user._id.toString()) {
    return next(ApiError.forbidden('You cannot change your own role'));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return next(ApiError.notFound('User not found'));

  return ApiResponse.success(res, { ...user.toJSON(), avatar: user.getAvatarUrl() }, 'Role updated');
};

// ─── Deactivate User (Admin only) ─────────────────────────────────────────────
const deactivateUser = async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(ApiError.forbidden('You cannot deactivate your own account'));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) return next(ApiError.notFound('User not found'));

  return ApiResponse.success(res, null, 'User deactivated successfully');
};

// ─── Delete User (Admin only) ─────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(ApiError.forbidden('You cannot delete your own account'));
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(ApiError.notFound('User not found'));

  await user.deleteOne();
  return ApiResponse.success(res, null, 'User deleted successfully');
};

module.exports = { getAllUsers, getUserById, updateUserRole, deactivateUser, deleteUser };
