import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),

  // IMPORTANT: Do NOT set Content-Type manually for FormData.
  // Axios auto-sets "multipart/form-data; boundary=..." from the FormData object.
  // Setting it manually omits the boundary and breaks multer's parser on the server.
  updateProfile: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) formData.append(key, val);
    });
    return api.put('/auth/profile', formData);
    // No custom headers — axios will set multipart/form-data + boundary automatically
  },

  changePassword: (data) => api.put('/auth/change-password', data),
};

