import { api, type ApiList } from './api';

export const qk = {
  magazines: (page = 1, pageSize = 20, search = '') =>
    ['magazines', page, pageSize, search] as const,

  magazine: (id: string) => ['magazine', id] as const,

  magArticles: (magId: string, page = 1, pageSize = 20) =>
    ['mag-articles', magId, page, pageSize] as const,

  magArticlesManage: (magId: string, tab: 'DRAFT' | 'PUBLISHED', page = 1, pageSize = 20) =>
    ['mag-articles-manage', magId, tab, page, pageSize] as const,

  article: (id: string) => ['article', id] as const,

  comments: (articleId: string, page = 1, pageSize = 20) =>
    ['comments', articleId, page, pageSize] as const,

  myMags: (page = 1, pageSize = 20) => ['my-mags', page, pageSize] as const,

  mySubs: (page = 1, pageSize = 20) => ['subs-me', page, pageSize] as const,
} as const;

export async function fetchMagazines(page = 1, pageSize = 12, search = '') {
  const r = await api.get<
    ApiList<{ id: string; title: string; description?: string; coverUrl?: string }>
  >(`/api/magazines`, { params: { page, pageSize, search } });
  return r.data;
}

export async function fetchMagazine(id: string) {
  const r = await api.get(`/api/magazines/${id}`);
  return r.data;
}

export async function fetchMagArticles(magId: string, page = 1, pageSize = 10) {
  const r = await api.get<
    ApiList<{ id: string; title: string; summary?: string; status: string; publishedAt?: string }>
  >(`/api/magazines/${magId}/articles`, { params: { page, pageSize } });
  return r.data;
}

export async function fetchArticle(id: string, token?: string) {
  const r = await api.get(`/api/articles/${id}`);
  return r.data as {
    article: {
      id: string;
      title: string;
      summary?: string;
      content?: string;
      status: 'PUBLISHED' | 'DRAFT';
      magazineId: string;
      publishedAt?: string | null;
    };
    access: 'FULL' | 'SUMMARY_ONLY';
  };
}

export async function login(email: string, password: string) {
  const r = await api.post('/api/auth/login', { email, password });
  return r.data as { user: any; token: string };
}

export async function registerUser(data: {
  email: string;
  name?: string;
  password: string;
  role: string;
}) {
  const r = await api.post('/api/auth/register', data);
  return r.data as { user: any; token: string };
}

export async function subscribe(magId: string) {
  const r = await api.post(`/api/magazines/${magId}/subscribe`);
  return r.data as { id: string; alreadyActive: boolean };
}

export type SubscriptionDTO = {
  id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
  startAt: string;
  endAt: string;
  magazine: {
    id: string;
    title: string;
    coverUrl?: string | null;
  };
};

export async function fetchMySubscriptions(page = 1, pageSize = 12) {
  const r = await api.get<ApiList<SubscriptionDTO>>('/api/subscriptions/me', {
    params: { page, pageSize },
  });
  return r.data;
}

// ---------- Types ----------
export type CommentDTO = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name?: string | null };
};

export type CommentsList = {
  items: CommentDTO[];
  total: number;
  page: number;
  pageSize: number;
};

if (!('comments' in qk)) {
  (qk as any).comments = (articleId: string, page = 1, pageSize = 10) =>
    ['comments', articleId, page, pageSize] as const;
}

export async function fetchComments(articleId: string, page = 1, pageSize = 10) {
  const r = await api.get<CommentsList>(`/api/articles/${articleId}/comments`, {
    params: { page, pageSize },
  });
  return r.data;
}

export async function addComment(articleId: string, body: string) {
  const r = await api.post<{ id: string }>(`/api/articles/${articleId}/comments`, { body });
  return r.data;
}

export async function deleteComment(commentId: string) {
  await api.delete(`/api/comments/${commentId}`);
  return { ok: true };
}

// ========== Types ==========
export type MagazineLite = {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
};
export type ArticleRow = {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
  updatedAt?: string | null;
};

// ========== Query Keys ==========
if (!('myMags' in qk))
  (qk as any).myMags = (page = 1, pageSize = 20) => ['my-mags', page, pageSize] as const;
if (!('magArticlesManage' in qk))
  (qk as any).magArticlesManage = (
    magId: string,
    status: 'DRAFT' | 'PUBLISHED',
    page = 1,
    pageSize = 10,
  ) => ['mag-articles-manage', magId, status, page, pageSize] as const;

// ========== API ==========
export async function fetchMyMagazines(page = 1, pageSize = 20) {
  const r = await api.get<ApiList<MagazineLite>>('/api/magazines', {
    params: { mine: true, page, pageSize },
  });
  return r.data;
}

export async function fetchMagArticlesManage(
  magId: string,
  status: 'DRAFT' | 'PUBLISHED',
  page = 1,
  pageSize = 10,
) {
  const r = await api.get<ApiList<ArticleRow>>(`/api/magazines/${magId}/articles`, {
    params: { status, page, pageSize },
  });
  return r.data;
}

export async function createArticle(
  magazineId: string,
  input: { title: string; summary?: string; content?: string; status?: 'DRAFT' | 'PUBLISHED' },
) {
  const payload = { ...input, status: input.status ?? ('PUBLISHED' as const) };

  const r = await api.post<{ id: string }>(`/api/magazines/${magazineId}/articles`, payload);
  return r.data;
}

export async function updateArticle(
  articleId: string,
  patch: Partial<{ title: string; summary?: string | null; content?: string | null }>,
) {
  const r = await api.patch(`/api/articles/${articleId}`, patch);
  return r.data;
}

export async function publishArticle(articleId: string) {
  const r = await api.post(`/api/articles/${articleId}/publish`, {});
  return r.data;
}

export async function unpublishArticle(articleId: string) {
  const r = await api.post(`/api/articles/${articleId}/unpublish`, {});
  return r.data;
}

export async function deleteArticle(articleId: string) {
  const r = await api.delete(`/api/articles/${articleId}`);
  return r.data;
}
