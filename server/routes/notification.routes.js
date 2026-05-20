const express = require('express');
const router = express.Router();

const {
  getNotifications, markAsRead, markAllAsRead,
  deleteNotification, deleteAllNotifications,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.delete('/clear-all', deleteAllNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
