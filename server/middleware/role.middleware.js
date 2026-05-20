const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware
 */

/**
 * Require Admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};

/**
 * Allow multiple roles
 * Usage: requireRole('admin', 'member')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access restricted to: ${roles.join(', ')}`));
    }
    next();
  };
};

/**
 * Require that the authenticated user is the resource owner OR an admin
 * @param {Function} getOwnerId - Async function that receives req and returns the owner's user ID
 */
const requireOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(ApiError.unauthorized());
      if (req.user.role === 'admin') return next(); // Admins bypass ownership check

      const ownerId = await getOwnerId(req);
      if (!ownerId) return next(ApiError.notFound());

      if (ownerId.toString() !== req.user._id.toString()) {
        return next(ApiError.forbidden('You do not have permission to perform this action'));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireAdmin, requireRole, requireOwnerOrAdmin };
