const express = require('express');
const router = express.Router();

const { getAllUsers, getUserById, updateUserRole, deactivateUser, deleteUser } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// All user routes require authentication
router.use(verifyToken);

router.get('/', requireAdmin, getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', requireAdmin, updateUserRole);
router.put('/:id/deactivate', requireAdmin, deactivateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
