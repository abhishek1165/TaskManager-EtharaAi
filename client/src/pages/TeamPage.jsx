import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, Search, Shield, UserCheck, UserX } from 'lucide-react';
import { userService } from '../services/user.service';
import { RoleBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { formatDate, getInitials, timeAgo } from '../utils/cn';
import { addToast } from '../redux/slices/uiSlice';
import { useDispatch } from 'react-redux';

export default function TeamPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({ search, role: roleFilter, limit: 50 });
      setUsers(res.data.data || []);
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to load team members' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      dispatch(addToast({ type: 'success', title: 'Role updated' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to update role' }));
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await userService.deactivate(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      dispatch(addToast({ type: 'success', title: 'User deactivated' }));
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to deactivate' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} members</p>
      </div>

      {/* Filters */}
      {isAdmin && (
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-52 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none text-foreground"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)}
            </tbody>
          </table>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No team members found" description="No users match your search." />
        ) : (
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                {['Member', 'Email', 'Role', 'Last Active', ...(isAdmin ? ['Actions'] : [])].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden flex-shrink-0">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : getInitials(u.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        {u._id === user._id && <span className="text-xs text-brand-500">(You)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {u.lastLogin ? timeAgo(u.lastLogin) : 'Never'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u._id !== user._id && (
                          <>
                            <button
                              onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'member' : 'admin')}
                              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 px-2 py-1 rounded border border-border hover:border-primary"
                              title="Toggle role"
                            >
                              <Shield size={12} />
                              {u.role === 'admin' ? 'Make Member' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDeactivate(u._id)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 px-2 py-1 rounded border border-border hover:border-destructive"
                            >
                              <UserX size={12} /> Deactivate
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
