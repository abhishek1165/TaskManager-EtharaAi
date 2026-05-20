import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Edit3, Trash2, Send, User as UserIcon,
  Calendar, Clock, MessageSquare, CheckCircle,
} from 'lucide-react';
import { fetchTaskById, updateTask, deleteTask, addTaskComment } from '../redux/slices/taskSlice';
import Button from '../components/ui/Button';
import { Textarea, Select } from '../components/ui/FormFields';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { formatDate, timeAgo, getInitials, titleCase, isOverdue } from '../utils/cn';
import { addToast } from '../redux/slices/uiSlice';

const STATUSES = ['todo', 'in-progress', 'review', 'completed'];

export default function TaskDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask: task, loading } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [id, dispatch]);

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    await dispatch(updateTask({ id, data: { status } }));
    setUpdatingStatus(false);
    dispatch(addToast({ type: 'success', title: `Status updated to ${titleCase(status)}` }));
    dispatch(fetchTaskById(id));
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    const result = await dispatch(addTaskComment({ id, content: comment.trim() }));
    setSendingComment(false);
    if (addTaskComment.fulfilled.match(result)) {
      setComment('');
      dispatch(addToast({ type: 'success', title: 'Comment added' }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await dispatch(deleteTask(id));
    dispatch(addToast({ type: 'success', title: 'Task deleted' }));
    navigate('/tasks');
  };

  if (loading && !task) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!task) return <div className="text-center text-muted-foreground py-24">Task not found.</div>;

  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tasks')} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1 truncate">{task.title}</h1>
        {isAdmin && (
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">Description</h2>
            {task.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided.</p>
            )}
          </div>

          {/* Status Quick-Change */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    task.status === s
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground'
                  }`}
                >
                  {task.status === s && <CheckCircle size={12} className="inline mr-1" />}
                  {titleCase(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare size={16} />
              Comments ({task.comments?.length || 0})
            </h2>

            <div className="space-y-4 mb-6">
              {task.comments?.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No comments yet. Be the first!</p>
              )}
              {task.comments?.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden">
                    {c.author?.avatar ? (
                      <img src={c.author.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(c.author?.name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{c.author?.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  id="comment-input"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleComment();
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    loading={sendingComment}
                    disabled={!comment.trim()}
                    leftIcon={<Send size={14} />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Task Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <StatusBadge status={task.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project</p>
                <button
                  onClick={() => navigate(`/projects/${task.project?._id}`)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {task.project?.title || '—'}
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs overflow-hidden">
                      {task.assignedTo.avatar ? (
                        <img src={task.assignedTo.avatar} alt="" className="w-full h-full object-cover" />
                      ) : getInitials(task.assignedTo.name)}
                    </div>
                    <span className="text-sm text-foreground">{task.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                <p className={`text-sm font-medium flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-foreground'}`}>
                  <Calendar size={13} />
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                  {overdue && <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full ml-1">Overdue</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <p className="text-sm text-muted-foreground">{timeAgo(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm text-muted-foreground">{timeAgo(task.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
