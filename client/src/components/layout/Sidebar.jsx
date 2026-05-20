import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Bell, User, LogOut, ChevronLeft, Zap, Settings,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { cn, getInitials } from '../../utils/cn';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',     icon: FolderKanban,    label: 'Projects' },
  { to: '/tasks',        icon: CheckSquare,     label: 'Tasks' },
  { to: '/team',         icon: Users,           label: 'Team' },
  { to: '/notifications',icon: Bell,            label: 'Notifications' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { sidebarOpen, unreadCount } = useSelector((s) => ({
    sidebarOpen: s.ui.sidebarOpen,
    unreadCount: s.notifications.unreadCount,
  }));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex-col',
        'bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]',
        'transition-all duration-300 ease-in-out',
        'hidden md:flex',
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
        </div>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn('nav-item', isActive && 'active')}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-4 border-t border-[hsl(var(--sidebar-border))] mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Account
          </p>
          <NavLink to="/profile" className={({ isActive }) => cn('nav-item', isActive && 'active')}>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(user?.name)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
