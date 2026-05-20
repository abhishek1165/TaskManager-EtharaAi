import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Plus, UserPlus, UserMinus, Settings,
  Calendar, Users, CheckSquare, Clock, AlertTriangle, Trash2,
} from 'lucide-react';
import {
  fetchProjectById, addProjectMember, removeProjectMember, deleteProject, updateProject,
} from '../redux/slices/projectSlice';
import { fetchTasks } from '../redux/slices/taskSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/FormFields';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/ui/Badge';
import { formatDate, timeAgo, getInitials } from '../utils/cn';
import { addToast } from '../redux/slices/uiSlice';
import { userService } from '../services/user.service';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject: project, loading } = useSelector((s) => s.projects);
  const { list: tasks } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchTasks({ projectId: id, limit: 100 }));
  }, [id, dispatch]);

  useEffect(() => {
    if (isAdmin) {
      userService.getAll({ limit: 100 }).then((res) => {
        setAllUsers(res.data.data || []);
      });
    }
  }, [isAdmin]);

  const projectTasks = tasks.filter((t) => t.project?._id === id || t.project === id);
  const stats = {
    total: projectTasks.length,
    completed: projectTasks.filter((t) => t.status === 'completed').length,
    inProgress: projectTasks.filter((t) => t.status === 'in-progress').length,
    todo: projectTasks.filter((t) => t.status === 'todo').length,
  };
  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setAddingMember(true);
    const result = await dispatch(addProjectMember({ id, data: { userId: selectedUser, role: memberRole } }));
    setAddingMember(false);
    if (addProjectMember.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Member added' }));
      setAddMemberOpen(false);
      setSelectedUser('');
    } else {
      dispatch(addToast({ type: 'error', title: result.payload }));
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    const result = await dispatch(removeProjectMember({ projectId: id, userId }));
    if (removeProjectMember.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Member removed' }));
    }
  };

  if (loading && !project) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!project) return null;

  // Non-members of a non-admin project redirect
  const existingMemberIds = project.members?.map((m) => m.user?._id || m.user) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<UserPlus size={14} />} onClick={() => setAddMemberOpen(true)}>
              Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'text-brand-500' },
          { label: 'Completed',   value: stats.completed, icon: CheckSquare, color: 'text-green-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-500' },
          { label: 'To Do',       value: stats.todo, icon: AlertTriangle, color: 'text-slate-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={color} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {project.deadline && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Calendar size={12} /> Deadline: {formatDate(project.deadline)}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {['tasks', 'members'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab} {tab === 'tasks' ? `(${stats.total})` : `(${project.members?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {isAdmin && (
            <Button
              onClick={() => navigate(`/tasks?projectId=${id}`)}
              leftIcon={<Plus size={16} />}
              size="sm"
            >
              Create Task in this Project
            </Button>
          )}
          {projectTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No tasks in this project yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Task', 'Assigned To', 'Priority', 'Status', 'Due Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectTasks.map((task) => (
                    <tr
                      key={task._id}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary truncate max-w-xs">{task.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                            {getInitials(task.assignedTo?.name || '?')}
                          </div>
                          <span className="text-sm text-muted-foreground truncate max-w-[100px]">
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3">
          {project.members?.map((member) => {
            const u = member.user;
            return (
              <div key={u?._id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0">
                  {u?.avatar ? <img src={u.avatar} alt={u?.name} className="w-full h-full object-cover" /> : getInitials(u?.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u?.name}</p>
                  <p className="text-xs text-muted-foreground">{u?.email}</p>
                </div>
                <RoleBadge role={member.role} />
                {isAdmin && u?._id !== user._id && (
                  <button
                    onClick={() => handleRemoveMember(u._id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Team Member">
        <div className="p-6 space-y-4">
          <Select
            id="member-select"
            label="Select user"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Choose a user...</option>
            {allUsers
              .filter((u) => !existingMemberIds.includes(u._id))
              .map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))
            }
          </Select>
          <Select
            id="member-role"
            label="Role in project"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex gap-3 justify-end border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} loading={addingMember} disabled={!selectedUser}>
              Add Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
