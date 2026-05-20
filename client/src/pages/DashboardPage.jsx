import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertTriangle, Layers,
  TrendingUp, FolderKanban, ArrowRight, Activity,
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import { dashboardService } from '../services/dashboard.service';
import { formatDate, timeAgo, getPriorityClass, getStatusClass, titleCase } from '../utils/cn';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { TaskCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const PRIORITY_COLORS = { low: '#3b82f6', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [stats, setStats] = React.useState(null);
  const [activity, setActivity] = React.useState([]);
  const [overdue, setOverdue] = React.useState([]);
  const [priorityStats, setPriorityStats] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsRes, actRes, overdueRes, priorityRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(8),
          dashboardService.getOverdue(),
          dashboardService.getPriorityStats(),
        ]);
        setStats(statsRes.data.data);
        setActivity(actRes.data.data.recentTasks || []);
        setOverdue(overdueRes.data.data.overdueTasks || []);
        setPriorityStats(priorityRes.data.data.priorityStats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const taskStatusData = stats ? [
    { name: 'Todo',        value: stats.tasks.todo,       fill: '#6366f1' },
    { name: 'In Progress', value: stats.tasks.inProgress, fill: '#f59e0b' },
    { name: 'Completed',   value: stats.tasks.completed,  fill: '#10b981' },
    { name: 'Overdue',     value: stats.tasks.overdue,    fill: '#ef4444' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your team today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats?.tasks.total}
          icon={Layers}
          color="indigo"
          loading={loading}
        />
        <StatsCard
          title="Completed"
          value={stats?.tasks.completed}
          icon={CheckSquare}
          color="green"
          description={`${stats?.tasks.completionRate ?? 0}% completion rate`}
          loading={loading}
        />
        <StatsCard
          title="In Progress"
          value={stats?.tasks.inProgress}
          icon={Clock}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="Overdue"
          value={stats?.tasks.overdue}
          icon={AlertTriangle}
          color="red"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Pie */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Task Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">Status breakdown of all tasks</p>
          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-muted animate-pulse" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={taskStatusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false} fontSize={11}>
                  {taskStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Distribution Bar */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Priority Breakdown</h2>
          <p className="text-sm text-muted-foreground mb-4">Tasks by priority level</p>
          {loading ? (
            <div className="h-52 bg-muted rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityStats} barSize={32}>
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickFormatter={titleCase} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v, n) => [v, titleCase(n)]} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityStats.map((entry, i) => (
                    <Cell key={i} fill={PRIORITY_COLORS[entry._id] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest task updates</p>
            </div>
            <button onClick={() => navigate('/tasks')} className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)
            ) : activity.length === 0 ? (
              <EmptyState icon={Activity} title="No recent activity" description="Tasks you update will appear here." />
            ) : (
              activity.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckSquare size={14} className="text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.project?.title} · {timeAgo(task.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Overdue Tasks</h2>
              <p className="text-sm text-muted-foreground">Tasks past their due date</p>
            </div>
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
              {overdue.length} overdue
            </span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)
            ) : overdue.length === 0 ? (
              <EmptyState icon={CheckSquare} title="No overdue tasks! 🎉" description="All tasks are on schedule." />
            ) : (
              overdue.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group border border-red-200/50 dark:border-red-900/30"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle size={14} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">{task.title}</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Due {formatDate(task.dueDate)} · {task.project?.title}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
