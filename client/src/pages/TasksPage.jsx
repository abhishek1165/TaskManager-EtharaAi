import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, LayoutGrid, List, Search, Calendar, User as UserIcon,
  GripVertical, MessageSquare, Clock,
} from 'lucide-react';
import { fetchTasks, updateTask, createTask, updateTaskStatusOptimistic } from '../redux/slices/taskSlice';
import { fetchProjects } from '../redux/slices/projectSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/FormFields';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TaskCardSkeleton } from '../components/ui/Skeleton';
import { formatDate, getInitials, titleCase, cn, isOverdue } from '../utils/cn';
import { addToast } from '../redux/slices/uiSlice';
import { useForm } from 'react-hook-form';
import { userService } from '../services/user.service';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: '#6366f1' },
  { id: 'in-progress', label: 'In Progress',  color: '#f59e0b' },
  { id: 'review',      label: 'Review',       color: '#8b5cf6' },
  { id: 'completed',   label: 'Completed',    color: '#10b981' },
];

function TaskForm({ task, projects, users, onSubmit, loading, onClose, defaultProjectId }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task || { priority: 'medium', status: 'todo', projectId: defaultProjectId || '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" id="task-form">
      <Input
        id="task-title"
        label="Task title *"
        placeholder="e.g. Design homepage mockup"
        error={errors.title?.message}
        {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 chars' } })}
      />
      <Textarea id="task-desc" label="Description" placeholder="Task details..." rows={3} {...register('description')} />
      <div className="grid grid-cols-2 gap-4">
        <Select id="task-project" label="Project *" error={errors.projectId?.message} {...register('projectId', { required: 'Project is required' })}>
          <option value="">Select project...</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </Select>
        <Select id="task-assignee" label="Assign to" {...register('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select id="task-priority" label="Priority" {...register('priority')}>
          {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
        </Select>
        <Select id="task-status" label="Status" {...register('status')}>
          {['todo', 'in-progress', 'review', 'completed'].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </Select>
      </div>
      <Input id="task-due" label="Due date" type="date" {...register('dueDate')} />
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{task ? 'Save Changes' : 'Create Task'}</Button>
      </div>
    </form>
  );
}

function KanbanCard({ task, index, onClick }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => onClick(task._id)}
          className={cn(
            'bg-card border border-border rounded-xl p-4 cursor-pointer',
            'hover:border-primary/40 hover:shadow-card-hover transition-all duration-200',
            snapshot.isDragging && 'shadow-xl rotate-1 border-primary',
          )}
        >
          <div
            {...provided.dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between mb-2"
          >
            <PriorityBadge priority={task.priority} />
            <GripVertical size={14} className="text-muted-foreground/50 cursor-grab" />
          </div>

          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{task.title}</h3>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1">
              {task.assignedTo ? (
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs overflow-hidden">
                  {task.assignedTo.avatar ? (
                    <img src={task.assignedTo.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(task.assignedTo.name)
                  )}
                </div>
              ) : (
                <UserIcon size={14} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.comments?.length > 0 && (
                <span className="flex items-center gap-1"><MessageSquare size={11} />{task.comments.length}</span>
              )}
              {task.dueDate && (
                <span className={cn('flex items-center gap-1', overdue && 'text-red-500')}>
                  <Clock size={11} />
                  {formatDate(task.dueDate, 'MMM d')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function TasksPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('projectId');

  const { list: tasks, loading } = useSelector((s) => s.tasks);
  const { list: projects } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [viewMode, setViewMode] = useState('kanban'); // kanban | list
  const [createOpen, setCreateOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(defaultProjectId || '');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchTasks({ search, priority: priorityFilter, projectId: projectFilter, limit: 200 }));
  }, [dispatch, search, priorityFilter, projectFilter]);

  useEffect(() => {
    dispatch(fetchProjects({}));
    userService.getAll({ limit: 100 }).then((res) => setAllUsers(res.data.data || []));
  }, [dispatch]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    const result = await dispatch(createTask(data));
    setFormLoading(false);
    if (createTask.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Task created' }));
      setCreateOpen(false);
    } else {
      dispatch(addToast({ type: 'error', title: result.payload }));
    }
  };

  const handleDragEnd = async (result) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    dispatch(updateTaskStatusOptimistic({ taskId: draggableId, status: newStatus }));

    // Persist to backend
    dispatch(updateTask({ id: draggableId, data: { status: newStatus } }));
  };

  const filteredTasks = tasks.filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnTasks = (status) => filteredTasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm">{filteredTasks.length} tasks</p>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
            >
              <List size={14} /> List
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={16} />}>New Task</Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-52 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none text-foreground"
        >
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none text-foreground"
        >
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const colTasks = getColumnTasks(col.id);
              return (
                <div key={col.id} className="flex-shrink-0 w-72">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="font-semibold text-foreground text-sm">{col.label}</h3>
                    <span className="ml-auto text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                      {colTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'min-h-[200px] space-y-3 p-2 rounded-xl transition-colors',
                          snapshot.isDraggingOver && 'bg-primary/5 kanban-over',
                        )}
                      >
                        {loading ? (
                          Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
                        ) : colTasks.length === 0 ? (
                          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                            <p className="text-xs text-muted-foreground">Drop tasks here</p>
                          </div>
                        ) : (
                          colTasks.map((task, index) => (
                            <KanbanCard
                              key={task._id}
                              task={task}
                              index={index}
                              onClick={(id) => navigate(`/tasks/${id}`)}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks found"
              description={isAdmin ? 'Create your first task to get started.' : 'No tasks assigned to you.'}
              action={isAdmin && <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={16} />}>Create Task</Button>}
            />
          ) : (
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {['Task', 'Project', 'Assigned', 'Priority', 'Status', 'Due Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';
                  return (
                    <tr
                      key={task._id}
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="hover:bg-accent cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary truncate max-w-xs">{task.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {task.project?.title || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs">
                            {getInitials(task.assignedTo?.name || '?')}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                      <td className={cn('px-4 py-3 text-sm', overdue ? 'text-red-500' : 'text-muted-foreground')}>
                        {task.dueDate ? formatDate(task.dueDate) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task">
        <TaskForm
          projects={projects}
          users={allUsers}
          onSubmit={handleCreate}
          loading={formLoading}
          onClose={() => setCreateOpen(false)}
          defaultProjectId={defaultProjectId}
        />
      </Modal>
    </div>
  );
}
