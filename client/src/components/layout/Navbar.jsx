import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, Sun, Moon, Bell, Search, PanelLeft } from 'lucide-react';
import { toggleSidebar, toggleMobileSidebar, toggleTheme } from '../../redux/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '../../utils/cn';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { theme, sidebarOpen } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notifications);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-4 px-4 md:px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Desktop sidebar toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
      >
        <PanelLeft size={18} />
      </button>

      {/* Mobile menu button */}
      <button
        onClick={() => dispatch(toggleMobileSidebar())}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
      >
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-background" />
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(user?.name)}</span>
          )}
        </button>
      </div>
    </header>
  );
}
