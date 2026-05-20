const express = require('express');
const router = express.Router();

const { getStats, getRecentActivity, getOverdueTasks, getPriorityStats } = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth.middleware');

router.use(verifyToken);

router.get('/stats', getStats);
router.get('/activity', getRecentActivity);
router.get('/overdue', getOverdueTasks);
router.get('/priority-stats', getPriorityStats);

module.exports = router;
