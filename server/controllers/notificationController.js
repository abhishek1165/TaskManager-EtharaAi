const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// ─── Get Notifications ─────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  return ApiResponse.paginated(
    res,
    { notifications, unreadCount },
    { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
  );
};

// ─── Mark Notification as Read ─────────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) return next(ApiError.notFound('Notification not found'));

  return ApiResponse.success(res, notification, 'Notification marked as read');
};

// ─── Mark All as Read ──────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return ApiResponse.success(res, null, 'All notifications marked as read');
};

// ─── Delete Notification ───────────────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) return next(ApiError.notFound('Notification not found'));

  return ApiResponse.success(res, null, 'Notification deleted');
};

// ─── Delete All Notifications ──────────────────────────────────────────────────
const deleteAllNotifications = async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  return ApiResponse.success(res, null, 'All notifications cleared');
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
