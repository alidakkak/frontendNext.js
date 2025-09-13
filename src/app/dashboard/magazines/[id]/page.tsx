'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchMagazine,
  fetchMagArticlesManage,
  publishArticle,
  qk,
  unpublishArticle,
  deleteArticle,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fmtDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

type ManageList = Awaited<ReturnType<typeof fetchMagArticlesManage>>;
type ManageItem = ManageList['items'][number];

export default function ManageMagazinePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const mag = useQuery({ queryKey: qk.magazine(id), queryFn: () => fetchMagazine(id) });
  const list = useQuery({
    queryKey: qk.magArticlesManage?.(id, tab, 1, 20) ?? ['mag-articles-manage', id, tab, 1, 20],
    queryFn: () => fetchMagArticlesManage(id, tab, 1, 20),
  });

  const doPublish = useMutation({
    mutationFn: (aid: string) => publishArticle(aid),
    onSuccess: async () => {
      toast.success('تم النشر');
      await qc.invalidateQueries({ queryKey: qk.magArticlesManage?.(id, 'DRAFT', 1, 20) });
      await qc.invalidateQueries({ queryKey: qk.magArticlesManage?.(id, 'PUBLISHED', 1, 20) });
    },
    onError: () => toast.error('فشل النشر'),
  });

  const doUnpublish = useMutation({
    mutationFn: (aid: string) => unpublishArticle(aid),
    onSuccess: async () => {
      toast.success('تم إلغاء النشر');
      await qc.invalidateQueries({ queryKey: qk.magArticlesManage?.(id, 'DRAFT', 1, 20) });
      await qc.invalidateQueries({ queryKey: qk.magArticlesManage?.(id, 'PUBLISHED', 1, 20) });
    },
    onError: () => toast.error('فشل العملية'),
  });

  const doDelete = useMutation({
    mutationFn: (aid: string) => deleteArticle(aid),
    onSuccess: async () => {
      toast.success('تم حذف المقال');
      await qc.invalidateQueries({ queryKey: qk.magArticlesManage?.(id, tab, 1, 20) });
    },
    onError: () => toast.error('تعذّر حذف المقال'),
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{mag.data?.title ?? 'إدارة المجلّة'}</h1>
          {mag.data?.description && (
            <p className="text-muted-foreground text-sm">{mag.data.description}</p>
          )}
        </div>
        <Link href={`/dashboard/magazines/${id}/new`}>
          <Button className="bg-emerald-600 hover:bg-emerald-500">+ مقال جديد</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-2">
        <div className="flex gap-2">
          {(['DRAFT', 'PUBLISHED'] as const).map((t) => (
            <button
              key={t}
              className={`rounded-xl px-3 py-1.5 text-sm ${tab === t ? 'bg-emerald-600 text-white' : 'border bg-white/70'}`}
              onClick={() => setTab(t)}
            >
              {t === 'DRAFT' ? 'مسودّات' : 'منشور'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-4 divide-y">
          {list.isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <Skeleton className="mb-2 h-4 w-60" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : !list.data?.items.length ? (
            <p className="text-muted-foreground p-4 text-sm">لا يوجد عناصر.</p>
          ) : (
            list.data.items.map((a: ManageItem) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium">{a.title}</div>
                  {a.publishedAt && (
                    <div className="text-muted-foreground text-xs">
                      نُشر: {fmtDate(a.publishedAt)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/magazines/${id}/articles/${a.id}/edit`}>
                    <Button variant="outline">تعديل</Button>
                  </Link>
                  {a.status === 'DRAFT' ? (
                    <Button onClick={() => doPublish.mutate(a.id)} disabled={doPublish.isPending}>
                      نشر
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => doUnpublish.mutate(a.id)}
                      disabled={doUnpublish.isPending}
                    >
                      إلغاء النشر
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('حذف المقال نهائيًا؟')) doDelete.mutate(a.id);
                    }}
                    disabled={doDelete.isPending}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
