import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notification.service';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await notificationService.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await notificationService.markAsRead(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await notificationService.markAllAsRead();
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    await notificationService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data?.notifications || [];
        state.unreadCount = action.payload.data?.unreadCount || 0;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.list.find((n) => n._id === action.payload);
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const n = state.list.find((n) => n._id === action.payload);
        if (n && !n.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.list = state.list.filter((n) => n._id !== action.payload);
      });
  },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
