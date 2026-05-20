import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: (limit) => api.get('/dashboard/activity', { params: { limit } }),
  getOverdue: () => api.get('/dashboard/overdue'),
  getPriorityStats: () => api.get('/dashboard/priority-stats'),
};
