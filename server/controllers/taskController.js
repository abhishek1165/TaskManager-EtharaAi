const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { sendNotification } = require('../utils/sendNotification');

// ─── Create Task ───────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  const { title, description, projectId, assignedTo, priority, status, dueDate, estimatedHours, tags } = req.body;

  // Verify project exists and user has access
  const project = await Project.findById(projectId);
  if (!project) return next(ApiError.notFound('Project not found'));

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    priority,
    status: status || 'todo',
    dueDate,
    estimatedHours,
    tags,
  });

  await task.populate('assignedTo', 'name email avatar');
  await task.populate('createdBy', 'name email');
  await task.populate('project', 'title');

  // Notify assigned user
  if (assignedTo && assignedTo !== req.user._id.toString()) {
    await sendNotification({
      recipientId: assignedTo,
      senderId: req.user._id,
      type: 'task_assigned',
      message: `You have been assigned task "${title}" in project "${project.title}"`,
      link: `/tasks/${task._id}`,
      metadata: { taskId: task._id, projectId },
    });
  }

  return ApiResponse.created(res, task, 'Task created successfully');
};

// ─── Get All Tasks ─────────────────────────────────────────────────────────────
const getTasks = async (req, res) => {
  const { projectId, status, priority, assignedTo, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = {};

  // Non-admins only see tasks in their projects
  if (req.user.role !== 'admin') {
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id');
    const projectIds = userProjects.map((p) => p._id);
    query.project = { $in: projectIds };
  }

  if (projectId) query.project = projectId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'title color')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(query),
  ]);

  return ApiResponse.paginated(res, tasks, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
};

// ─── Get Task by ID ────────────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title color status')
    .populate('comments.author', 'name email avatar');

  if (!task) return next(ApiError.notFound('Task not found'));

  return ApiResponse.success(res, task);
};

// ─── Update Task ───────────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  const { title, description, assignedTo, priority, status, dueDate, estimatedHours, tags } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return next(ApiError.notFound('Task not found'));

  const previousAssignee = task.assignedTo?.toString();
  const previousStatus = task.status;

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
  if (priority) task.priority = priority;
  if (status) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
  if (tags) task.tags = tags;

  await task.save();

  await task.populate('assignedTo', 'name email avatar');
  await task.populate('createdBy', 'name email');
  await task.populate('project', 'title');

  // Notify new assignee if changed
  const newAssignee = task.assignedTo?._id?.toString();
  if (assignedTo && newAssignee !== previousAssignee && newAssignee !== req.user._id.toString()) {
    await sendNotification({
      recipientId: newAssignee,
      senderId: req.user._id,
      type: 'task_assigned',
      message: `You have been assigned task "${task.title}"`,
      link: `/tasks/${task._id}`,
      metadata: { taskId: task._id },
    });
  }

  // Notify original assignee if status changed
  if (status && status !== previousStatus && previousAssignee && previousAssignee !== req.user._id.toString()) {
    await sendNotification({
      recipientId: previousAssignee,
      senderId: req.user._id,
      type: 'task_updated',
      message: `Task "${task.title}" status changed to ${status}`,
      link: `/tasks/${task._id}`,
      metadata: { taskId: task._id },
    });
  }

  return ApiResponse.success(res, task, 'Task updated successfully');
};

// ─── Delete Task ───────────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(ApiError.notFound('Task not found'));

  await task.deleteOne();
  return ApiResponse.success(res, null, 'Task deleted successfully');
};

// ─── Add Comment ───────────────────────────────────────────────────────────────
const addComment = async (req, res, next) => {
  const { content } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return next(ApiError.notFound('Task not found'));

  task.comments.push({ author: req.user._id, content });
  await task.save();

  await task.populate('comments.author', 'name email avatar');

  const newComment = task.comments[task.comments.length - 1];

  // Notify task assignee about new comment (if not the commenter)
  if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
    await sendNotification({
      recipientId: task.assignedTo,
      senderId: req.user._id,
      type: 'comment_added',
      message: `${req.user.name} commented on task "${task.title}"`,
      link: `/tasks/${task._id}`,
      metadata: { taskId: task._id, commentId: newComment._id },
    });
  }

  return ApiResponse.created(res, newComment, 'Comment added successfully');
};

// ─── Delete Comment ────────────────────────────────────────────────────────────
const deleteComment = async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(ApiError.notFound('Task not found'));

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return next(ApiError.notFound('Comment not found'));

  // Only allow comment author or admin to delete
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(ApiError.forbidden('You cannot delete this comment'));
  }

  comment.deleteOne();
  await task.save();

  return ApiResponse.success(res, null, 'Comment deleted successfully');
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask, addComment, deleteComment };
