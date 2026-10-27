import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

// Request interceptor: attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle token expiry
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillswap_token');
      localStorage.removeItem('skillswap_user');
      const pathname = window.location.pathname;
      if (pathname !== '/login' && pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  demoLogin: () => API.post('/auth/demo-login'),
  demoReset: () => API.post('/auth/demo-reset'),
  getMe: () => API.get('/auth/me'),
  changePassword: (data) => API.put('/auth/change-password', data)
};

// Users
export const usersAPI = {
  getProfile: (id) => API.get(`/users/profile/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
  addOfferedSkill: (data) => API.post('/users/skills/offer', data),
  removeOfferedSkill: (id) => API.delete(`/users/skills/offer/${id}`),
  addNeededSkill: (data) => API.post('/users/skills/need', data),
  removeNeededSkill: (id) => API.delete(`/users/skills/need/${id}`),
  getNotifications: () => API.get('/users/notifications'),
  markAllRead: () => API.put('/users/notifications/read'),
  markOneRead: (id) => API.put(`/users/notifications/${id}/read`),
  search: (params) => API.get('/users/search', { params }),
  getMatches: () => API.get('/users/matches')
};

// Skill Offers
export const offersAPI = {
  getAll: (params) => API.get('/offers', { params }),
  getMy: () => API.get('/offers/my'),
  getOne: (id) => API.get(`/offers/${id}`),
  create: (data) => API.post('/offers', data),
  update: (id, data) => API.put(`/offers/${id}`, data),
  delete: (id) => API.delete(`/offers/${id}`)
};

// Skill Requests
export const requestsAPI = {
  getAll: (params) => API.get('/requests', { params }),
  getMy: () => API.get('/requests/my'),
  getOne: (id) => API.get(`/requests/${id}`),
  create: (data) => API.post('/requests', data),
  update: (id, data) => API.put(`/requests/${id}`, data),
  delete: (id) => API.delete(`/requests/${id}`)
};

// Proposals
export const proposalsAPI = {
  send: (data) => API.post('/proposals', data),
  getSent: () => API.get('/proposals/sent'),
  getReceived: () => API.get('/proposals/received'),
  accept: (id, data) => API.put(`/proposals/${id}/accept`, data),
  reject: (id, data) => API.put(`/proposals/${id}/reject`, data),
  cancel: (id, data) => API.put(`/proposals/${id}/cancel`, data)
};

// Sessions
export const sessionsAPI = {
  getAll: (params) => API.get('/sessions', { params }),
  getOne: (id) => API.get(`/sessions/${id}`),
  create: (data) => API.post('/sessions', data),
  markComplete: (id) => API.put(`/sessions/${id}/complete`),
  cancel: (id, data) => API.put(`/sessions/${id}/cancel`, data),
  reschedule: (id, data) => API.put(`/sessions/${id}/reschedule`, data),
  updateMeetingLink: (id, meetLink) => API.put(`/sessions/${id}/meeting-link`, { meetLink })
};

// Reviews
export const reviewsAPI = {
  submit: (data) => API.post('/reviews', data),
  getForUser: (userId) => API.get(`/reviews/user/${userId}`),
  getForSession: (sessionId) => API.get(`/reviews/session/${sessionId}`)
};

// Dashboard
export const dashboardAPI = {
  get: () => API.get('/dashboard')
};

export default API;
