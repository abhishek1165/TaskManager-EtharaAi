import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../redux/slices/uiSlice';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const icons = {
  success: { Icon: CheckCircle, className: 'text-green-500' },
  error:   { Icon: XCircle,     className: 'text-red-500' },
  warning: { Icon: AlertCircle, className: 'text-yellow-500' },
  info:    { Icon: Info,        className: 'text-blue-500' },
};

function Toast({ id, type = 'info', title, message }) {
  const dispatch = useDispatch();
  const { Icon, className } = icons[type] || icons.info;

  React.useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(id)), 5000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-card animate-fade-in',
      'border-border min-w-[300px] max-w-[420px]'
    )}>
      <Icon size={20} className={cn('flex-shrink-0 mt-0.5', className)} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
        {message && <p className="text-sm text-muted-foreground mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => dispatch(removeToast(id))}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useSelector((s) => s.ui.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}
