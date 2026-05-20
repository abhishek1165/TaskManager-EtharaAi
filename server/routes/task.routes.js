const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createTask, getTasks, getTaskById, updateTask,
  deleteTask, addComment, deleteComment,
} = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const { handleValidationErrors } = require('../middleware/validate.middleware');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 200 }),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 2000 }),
];

router.use(verifyToken);

router.get('/', getTasks);
router.post('/', requireAdmin, taskValidation, handleValidationErrors, createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask); // Members can update status
router.delete('/:id', requireAdmin, deleteTask);

// Comments
router.post('/:id/comments', commentValidation, handleValidationErrors, addComment);
router.delete('/:id/comments/:commentId', deleteComment);

module.exports = router;
