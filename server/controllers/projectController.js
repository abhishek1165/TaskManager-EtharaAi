const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { sendNotification, sendBulkNotifications } = require('../utils/sendNotification');

// ─── Create Project ────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  const { title, description, deadline, priority, color, tags } = req.body;

  const project = await Project.create({
    title,
    description,
    deadline,
    priority,
    color,
    tags,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }], // Creator is admin
  });

  await project.populate('createdBy', 'name email avatar');

  return ApiResponse.created(res, project, 'Project created successfully');
};

// ─── Get All Projects ──────────────────────────────────────────────────────────
const getProjects = async (req, res) => {
  const { search, status, page = 1, limit = 12 } = req.query;

  // Admins see all projects; members only see their projects
  let query = {};
  if (req.user.role !== 'admin') {
    query['members.user'] = req.user._id;
  }
  if (search) query.title = { $regex: search, $options: 'i' };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(query),
  ]);

  // Attach task stats for each project
  const projectIds = projects.map((p) => p._id);
  const taskStats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
      },
    },
  ]);

  const statsMap = {};
  taskStats.forEach((s) => { statsMap[s._id.toString()] = s; });

  const enrichedProjects = projects.map((p) => {
    const stats = statsMap[p._id.toString()] || { total: 0, completed: 0, inProgress: 0, todo: 0 };
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return { ...p.toJSON(), taskStats: stats, progress };
  });

  return ApiResponse.paginated(res, enrichedProjects, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
};

// ─── Get Project by ID ─────────────────────────────────────────────────────────
const getProjectById = async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email avatar role');

  if (!project) return next(ApiError.notFound('Project not found'));

  // Check if user has access
  const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
  if (req.user.role !== 'admin' && !isMember) {
    return next(ApiError.forbidden('You do not have access to this project'));
  }

  // Task stats
  const taskStats = await Task.aggregate([
    { $match: { project: project._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
      },
    },
  ]);

  const stats = taskStats[0] || { total: 0, completed: 0, inProgress: 0, todo: 0, review: 0 };
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return ApiResponse.success(res, { ...project.toJSON(), taskStats: stats, progress });
};

// ─── Update Project ────────────────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  const { title, description, status, deadline, priority, color, tags } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) return next(ApiError.notFound('Project not found'));

  if (title) project.title = title;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (deadline !== undefined) project.deadline = deadline;
  if (priority) project.priority = priority;
  if (color) project.color = color;
  if (tags) project.tags = tags;

  await project.save();
  await project.populate('createdBy', 'name email');
  await project.populate('members.user', 'name email avatar');

  return ApiResponse.success(res, project, 'Project updated successfully');
};

// ─── Delete Project ────────────────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(ApiError.notFound('Project not found'));

  // Delete all tasks in this project
  await Task.deleteMany({ project: req.params.id });
  await project.deleteOne();

  return ApiResponse.success(res, null, 'Project and all its tasks deleted successfully');
};

// ─── Add Member ────────────────────────────────────────────────────────────────
const addMember = async (req, res, next) => {
  const { userId, role = 'member' } = req.body;

  const project = await Project.findById(req.params.id);
  if (!project) return next(ApiError.notFound('Project not found'));

  const user = await User.findById(userId);
  if (!user) return next(ApiError.notFound('User not found'));

  // Check if already a member
  const isAlreadyMember = project.members.some((m) => m.user.toString() === userId);
  if (isAlreadyMember) {
    return next(ApiError.conflict('User is already a member of this project'));
  }

  project.members.push({ user: userId, role });
  await project.save();
  await project.populate('members.user', 'name email avatar');

  // Send notification
  await sendNotification({
    recipientId: userId,
    senderId: req.user._id,
    type: 'project_added',
    message: `You have been added to project "${project.title}"`,
    link: `/projects/${project._id}`,
    metadata: { projectId: project._id },
  });

  return ApiResponse.success(res, project.members, 'Member added successfully');
};

// ─── Remove Member ─────────────────────────────────────────────────────────────
const removeMember = async (req, res, next) => {
  const { userId } = req.params;

  const project = await Project.findById(req.params.id);
  if (!project) return next(ApiError.notFound('Project not found'));

  // Prevent removing the creator
  if (project.createdBy.toString() === userId) {
    return next(ApiError.forbidden('Cannot remove the project creator'));
  }

  const memberIndex = project.members.findIndex((m) => m.user.toString() === userId);
  if (memberIndex === -1) {
    return next(ApiError.notFound('User is not a member of this project'));
  }

  project.members.splice(memberIndex, 1);
  await project.save();

  await sendNotification({
    recipientId: userId,
    senderId: req.user._id,
    type: 'member_removed',
    message: `You have been removed from project "${project.title}"`,
    link: '/projects',
  });

  return ApiResponse.success(res, null, 'Member removed successfully');
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
