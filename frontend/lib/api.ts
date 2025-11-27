import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email: string, phone: string, password: string) => {
  const response = await api.post('/auth/login', { email, phone, password });
  return response.data;
};

export const register = async (
  email: string,
  phone: string,
  password: string,
  firstName?: string,
  lastName?: string
) => {
  const response = await api.post('/auth/register', {
    email,
    phone,
    password,
    firstName,
    lastName,
  });
  return response.data;
};

// Bookings
export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBooking = async (id: string) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// Attachments
export const getAttachments = async (bookingId: string) => {
  const response = await api.get(`/bookings/${bookingId}/attachments`);
  return response.data;
};

// Messages
export const getMessages = async (bookingId: string) => {
  const response = await api.get(`/bookings/${bookingId}/messages`);
  return response.data;
};

export const sendMessage = async (bookingId: string, message: string) => {
  const response = await api.post(`/bookings/${bookingId}/messages`, { message });
  return response.data;
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// ServiceM8 Integration (Real API calls)
export const getServiceM8Company = async () => {
  const response = await api.get('/servicem8/company');
  return response.data;
};

export const getServiceM8Jobs = async () => {
  const response = await api.get('/servicem8/jobs');
  return response.data;
};

// Admin APIs
export const adminGetAllBookings = async () => {
  const response = await api.get('/admin/bookings');
  return response.data;
};

export const adminGetAllCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const adminCreateBooking = async (booking: any) => {
  const response = await api.post('/admin/bookings', booking);
  return response.data;
};

export const adminUpdateBooking = async (id: string, booking: any) => {
  const response = await api.put(`/admin/bookings/${id}`, booking);
  return response.data;
};

export const adminDeleteBooking = async (id: string) => {
  const response = await api.delete(`/admin/bookings/${id}`);
  return response.data;
};

export default api;
