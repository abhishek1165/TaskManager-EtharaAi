import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string
 */
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return 'N/A';
  return format(new Date(date), fmt);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Check if a date is overdue
 */
export function isOverdue(dueDate) {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date());
}

/**
 * Get priority color class
 */
export function getPriorityClass(priority) {
  const map = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    critical: 'priority-critical',
  };
  return map[priority] || 'priority-medium';
}

/**
 * Get status color class
 */
export function getStatusClass(status) {
  const map = {
    todo: 'status-todo',
    'in-progress': 'status-in-progress',
    review: 'status-review',
    completed: 'status-completed',
  };
  return map[status] || 'status-todo';
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str) {
  if (!str) return '';
  return str
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Truncate text to a given length
 */
export function truncate(str, maxLen = 100) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

/**
 * Generate a stable color from a string (for project colors)
 */
export function stringToColor(str) {
  if (!str) return '#6366f1';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${Math.abs(hue)}, 65%, 55%)`;
}
