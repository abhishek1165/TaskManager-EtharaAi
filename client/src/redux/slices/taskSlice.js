import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/task.service';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await taskService.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await taskService.getById(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await taskService.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await taskService.update(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await taskService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const addTaskComment = createAsyncThunk('tasks/addComment', async ({ id, content }, { rejectWithValue }) => {
  try {
    const res = await taskService.addComment(id, { content });
    return { taskId: id, comment: res.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add comment');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    currentTask: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentTask(state) { state.currentTask = null; },
    clearError(state) { state.error = null; },
    // Optimistic update for Kanban drag-drop
    updateTaskStatusOptimistic(state, action) {
      const { taskId, status } = action.payload;
      const task = state.list.find((t) => t._id === taskId);
      if (task) task.status = status;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchTasks.pending, pending)
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, rejected)

      .addCase(fetchTaskById.pending, pending)
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, rejected)

      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) state.currentTask = null;
      })

      .addCase(addTaskComment.fulfilled, (state, action) => {
        if (state.currentTask?._id === action.payload.taskId) {
          state.currentTask.comments.push(action.payload.comment);
        }
      });
  },
});

export const { clearCurrentTask, clearError, updateTaskStatusOptimistic } = taskSlice.actions;
export default taskSlice.reducer;
