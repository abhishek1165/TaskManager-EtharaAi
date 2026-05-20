const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createProject, getProjects, getProjectById, updateProject,
  deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('deadline').optional().isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed', 'archived']),
];

router.use(verifyToken);

router.get('/', getProjects);
router.post('/', requireAdmin, projectValidation, handleValidationErrors, createProject);
router.get('/:id', getProjectById);
router.put('/:id', requireAdmin, projectValidation, handleValidationErrors, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

// Member management
router.post('/:id/members', requireAdmin, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('role').optional().isIn(['admin', 'member']),
], handleValidationErrors, addMember);
router.delete('/:id/members/:userId', requireAdmin, removeMember);

module.exports = router;
