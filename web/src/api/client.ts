import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Adding the type to 'config' fixes the error
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;