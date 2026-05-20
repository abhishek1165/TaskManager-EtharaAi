const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');

// ─── Get Dashboard Stats ───────────────────────────────────────────────────────
const getStats = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const userId = req.user._id;

  let taskQuery = {};
  let projectQuery = {};

  if (!isAdmin) {
    // Members see stats for their assigned tasks and joined projects
    taskQuery = { assignedTo: userId };
    const memberProjects = await Project.find({ 'members.user': userId }).select('_id');
    projectQuery = { _id: { $in: memberProjects.map((p) => p._id) } };
  }

  const now = new Date();

  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    totalProjects,
    activeProjects,
    totalUsers,
  ] = await Promise.all([
    Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: 'completed' }),
    Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
    Task.countDocuments({ ...taskQuery, status: 'todo' }),
    Task.countDocuments({
      ...taskQuery,
      status: { $ne: 'completed' },
      dueDate: { $lt: now },
    }),
    Project.countDocuments(projectQuery),
    Project.countDocuments({ ...projectQuery, status: 'active' }),
    isAdmin ? User.countDocuments({ isActive: true }) : 0,
  ]);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return ApiResponse.success(res, {
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      todo: todoTasks,
      overdue: overdueTasks,
      completionRate,
    },
    projects: {
      total: totalProjects,
      active: activeProjects,
    },
    ...(isAdmin && { users: { total: totalUsers } }),
  });
};

// ─── Get Recent Activity (latest tasks + project updates) ─────────────────────
const getRecentActivity = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const limit = parseInt(req.query.limit) || 10;

  let taskQuery = {};
  if (!isAdmin) {
    taskQuery.assignedTo = req.user._id;
  }

  const recentTasks = await Task.find(taskQuery)
    .populate('assignedTo', 'name avatar')
    .populate('createdBy', 'name avatar')
    .populate('project', 'title color')
    .sort({ updatedAt: -1 })
    .limit(limit);

  return ApiResponse.success(res, { recentTasks });
};

// ─── Get Overdue Tasks ─────────────────────────────────────────────────────────
const getOverdueTasks = async (req, res) => {
  const now = new Date();
  const isAdmin = req.user.role === 'admin';

  let query = {
    status: { $ne: 'completed' },
    dueDate: { $lt: now },
  };

  if (!isAdmin) {
    query.assignedTo = req.user._id;
  }

  const overdueTasks = await Task.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('project', 'title color')
    .sort({ dueDate: 1 })
    .limit(20);

  return ApiResponse.success(res, { overdueTasks, count: overdueTasks.length });
};

// ─── Get Task Priority Distribution ───────────────────────────────────────────
const getPriorityStats = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const matchStage = isAdmin ? {} : { assignedTo: req.user._id };

  const stats = await Task.aggregate([
    { $match: matchStage },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return ApiResponse.success(res, { priorityStats: stats });
};

module.exports = { getStats, getRecentActivity, getOverdueTasks, getPriorityStats };
