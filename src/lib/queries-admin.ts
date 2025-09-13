import { api } from './api';

export const qkAdmin = {
  overview: ['admin-overview'] as const,
  users: (page = 1, pageSize = 20, search = '') => ['admin-users', page, pageSize, search] as const,
};

export type AdminOverview = {
  users: number;
  magazines: number;
  articles: number;
  activeSubs: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

export async function fetchAdminOverview() {
  const r = await api.get<AdminOverview>('/api/admin/overview');
  return r.data;
}

export async function fetchAdminUsers(page = 1, pageSize = 20, search = '') {
  const r = await api.get<Paginated<AdminUserRow>>('/api/admin/users', {
    params: { page, pageSize, search },
  });
  return r.data;
}

export async function patchAdminUser(
  id: string,
  body: Partial<Pick<AdminUserRow, 'role' | 'status'>>,
) {
  const r = await api.patch<{ id: string }>(`/api/admin/users/${id}`, body);
  return r.data;
}

export type AdminMagazineRow = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  publisherId?: string | null;
  publisher?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
};

export const qkAdminMag = {
  list: (page = 1, pageSize = 12, search = '') => ['admin-mags', page, pageSize, search] as const,
};

export async function fetchAdminMagazines(page = 1, pageSize = 12, search = '') {
  const r = await api.get<{
    items: AdminMagazineRow[];
    total: number;
    page: number;
    pageSize: number;
  }>('/api/magazines', { params: { page, pageSize, search } });
  return r.data;
}

export async function createAdminMagazine(input: {
  title: string;
  description?: string;
  coverUrl?: string;
}) {
  const r = await api.post<{ id: string }>('/api/magazines', input);
  return r.data;
}

export async function patchAdminMagazine(
  id: string,
  body: Partial<{ title: string; description?: string; coverUrl?: string }>,
) {
  const r = await api.patch<{ id: string }>(`/api/magazines/${id}`, body);
  return r.data;
}

export async function deleteAdminMagazine(id: string) {
  await api.delete(`/api/magazines/${id}`);
  return { ok: true };
}
