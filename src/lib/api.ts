import axios from 'axios';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const s = err?.response?.status;
    if (s === 401) toast.error('يجب تسجيل الدخول');
    if (s === 403) toast.error('لا تملك صلاحية لهذا الإجراء');
    throw err;
  },
);

export type ApiList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
