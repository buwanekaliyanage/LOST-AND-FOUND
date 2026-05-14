import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('laf_user'));
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  } catch {}
  return config;
});

export default api;
