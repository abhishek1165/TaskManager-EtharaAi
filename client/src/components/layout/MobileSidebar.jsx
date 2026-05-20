import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  Bell, User, LogOut, X, Zap,
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { closeMobileSidebar } from '../../redux/slices/uiSlice';
import { cn, getInitials } from '../../utils/cn';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',     icon: FolderKanban,    label: 'Projects' },
  { to: '/tasks',        icon: CheckSquare,     label: 'Tasks' },
  { to: '/team',         icon: Users,           label: 'Team' },
  { to: '/notifications',icon: Bell,            label: 'Notifications' },
  { to: '/profile',      icon: User,            label: 'Profile' },
];

export default function MobileSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { mobileSidebarOpen, unreadCount } = useSelector((s) => ({
    mobileSidebarOpen: s.ui.mobileSidebarOpen,
    unreadCount: s.notifications.unreadCount,
  }));

  const close = () => dispatch(closeMobileSidebar());

  const handleLogout = () => {
    dispatch(logout());
    close();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden',
          'bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]',
          'transition-transform duration-300 ease-in-out',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">TaskFlow</span>
          </div>
          <button onClick={close} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user?.name)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
