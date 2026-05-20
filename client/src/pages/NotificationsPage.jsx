import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import {
  fetchNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification,
} from '../redux/slices/notificationSlice';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo, cn } from '../utils/cn';

const TYPE_ICONS = {
  task_assigned: '📋',
  task_updated: '✏️',
  task_completed: '✅',
  task_overdue: '⚠️',
  project_added: '📁',
  comment_added: '💬',
  member_added: '👤',
  member_removed: '🚪',
  general: '🔔',
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 50 }));
  }, [dispatch]);

  const handleClick = (notification) => {
    if (!notification.isRead) dispatch(markNotificationRead(notification._id));
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck size={14} />}
            onClick={() => dispatch(markAllNotificationsRead())}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
        {loading && list.length === 0 ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! We'll let you know when something happens."
          />
        ) : (
          list.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                'flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-accent',
                !notification.isRead && 'bg-primary/5'
              )}
              onClick={() => handleClick(notification)}
            >
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0',
                !notification.isRead ? 'bg-brand-500/20' : 'bg-muted'
              )}>
                {TYPE_ICONS[notification.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm leading-snug',
                  !notification.isRead ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                  {!notification.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notification.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch(markNotificationRead(notification._id)); }}
                    className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(deleteNotification(notification._id)); }}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
