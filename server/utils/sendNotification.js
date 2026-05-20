const Notification = require('../models/Notification');

/**
 * Create a notification in the database
 * @param {Object} params
 * @param {string} params.recipientId - User ID of the recipient
 * @param {string} params.senderId - User ID of the sender (optional)
 * @param {string} params.type - Notification type
 * @param {string} params.message - Notification message
 * @param {string} params.link - Link to related resource (optional)
 * @param {Object} params.metadata - Extra metadata (optional)
 */
const sendNotification = async ({
  recipientId,
  senderId = null,
  type,
  message,
  link = null,
  metadata = {},
}) => {
  try {
    // Don't notify yourself
    if (senderId && recipientId.toString() === senderId.toString()) return null;

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      link,
      metadata,
    });

    return notification;
  } catch (error) {
    // Notifications are non-critical — log but don't throw
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Send notifications to multiple users
 * @param {string[]} recipientIds - Array of user IDs
 * @param {Object} notificationData - Notification data (same as sendNotification)
 */
const sendBulkNotifications = async (recipientIds, notificationData) => {
  const promises = recipientIds.map((recipientId) =>
    sendNotification({ ...notificationData, recipientId })
  );
  return Promise.allSettled(promises);
};

module.exports = { sendNotification, sendBulkNotifications };
