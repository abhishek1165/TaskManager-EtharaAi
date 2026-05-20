import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectService } from '../../services/project.service';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await projectService.getAll(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await projectService.getById(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await projectService.create(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await projectService.update(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await projectService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

export const addProjectMember = createAsyncThunk('projects/addMember', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await projectService.addMember(id, data);
    return { projectId: id, members: res.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add member');
  }
});

export const removeProjectMember = createAsyncThunk('projects/removeMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    await projectService.removeMember(projectId, userId);
    return { projectId, userId };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove member');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    currentProject: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProject(state) { state.currentProject = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchProjects.pending, pending)
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, rejected)

      .addCase(fetchProjectById.pending, pending)
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, rejected)

      .addCase(createProject.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
        if (state.currentProject?._id === action.payload) state.currentProject = null;
      })

      .addCase(addProjectMember.fulfilled, (state, action) => {
        if (state.currentProject?._id === action.payload.projectId) {
          state.currentProject.members = action.payload.members;
        }
      })

      .addCase(removeProjectMember.fulfilled, (state, action) => {
        if (state.currentProject?._id === action.payload.projectId) {
          state.currentProject.members = state.currentProject.members.filter(
            (m) => m.user._id !== action.payload.userId
          );
        }
      });
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;
