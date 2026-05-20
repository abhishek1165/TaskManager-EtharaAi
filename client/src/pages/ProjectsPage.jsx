import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FolderKanban, MoreVertical,
  Calendar, Users, TrendingUp, Trash2, Edit3,
} from 'lucide-react';
import { fetchProjects, createProject, updateProject, deleteProject } from '../redux/slices/projectSlice';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/FormFields';
import { CardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { formatDate, titleCase, stringToColor } from '../utils/cn';
import { useForm } from 'react-hook-form';
import { addToast } from '../redux/slices/uiSlice';

function ProjectForm({ project, onSubmit, loading, onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: project || { status: 'planning', priority: 'medium', color: '#6366f1' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" id="project-form">
      <Input id="proj-title" label="Project title *" placeholder="e.g. Website Redesign" error={errors.title?.message} {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 characters' } })} />
      <Textarea id="proj-desc" label="Description" placeholder="What is this project about?" rows={3} {...register('description')} />
      <div className="grid grid-cols-2 gap-4">
        <Select id="proj-status" label="Status" {...register('status')}>
          {['planning', 'active', 'on-hold', 'completed', 'archived'].map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </Select>
        <Select id="proj-priority" label="Priority" {...register('priority')}>
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <option key={p} value={p}>{titleCase(p)}</option>
          ))}
        </Select>
      </div>
      <Input id="proj-deadline" label="Deadline" type="date" {...register('deadline')} />
      <div className="flex gap-3 justify-end pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{project ? 'Save Changes' : 'Create Project'}</Button>
      </div>
    </form>
  );
}

function ProjectCard({ project, onEdit, onDelete, onClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const progress = project.progress || 0;
  const accentColor = project.color || stringToColor(project.title);

  return (
    <div
      className="group relative rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Color accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />

      <div className="p-5 pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
          </div>
          {isAdmin && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-10 w-40 rounded-xl border border-border bg-card shadow-lg py-1">
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project._id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description || 'No description provided'}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{project.members?.length || 0} members</span>
          </div>
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{formatDate(project.deadline)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{project.taskStats?.total || 0} tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((s) => s.projects);
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects({ search, status: statusFilter }));
  }, [dispatch, search, statusFilter]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    const result = await dispatch(createProject(data));
    setFormLoading(false);
    if (createProject.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Project created', message: data.title }));
      setModalOpen(false);
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    const result = await dispatch(updateProject({ id: editProject._id, data }));
    setFormLoading(false);
    if (updateProject.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Project updated' }));
      setEditProject(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    await dispatch(deleteProject(id));
    dispatch(addToast({ type: 'success', title: 'Project deleted' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{list.length} projects total</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={16} />}>
            New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Status</option>
          {['planning', 'active', 'on-hold', 'completed', 'archived'].map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={isAdmin ? "Create your first project to get started." : "You haven't been added to any projects yet."}
          action={isAdmin && <Button onClick={() => setModalOpen(true)} leftIcon={<Plus size={16} />}>Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onClick={() => navigate(`/projects/${project._id}`)}
              onEdit={setEditProject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Project">
        <ProjectForm onSubmit={handleCreate} loading={formLoading} onClose={() => setModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEditProject(null)} title="Edit Project">
        {editProject && (
          <ProjectForm project={editProject} onSubmit={handleEdit} loading={formLoading} onClose={() => setEditProject(null)} />
        )}
      </Modal>
    </div>
  );
}
