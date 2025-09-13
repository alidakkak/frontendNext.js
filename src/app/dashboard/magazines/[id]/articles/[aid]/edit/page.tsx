'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteArticle,
  fetchArticle,
  publishArticle,
  qk,
  unpublishArticle,
  updateArticle,
} from '@/lib/queries';
import ArticleForm from '@/components/ArticleForm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getLangDir } from '@/lib/i18n';

const SHOW_PUBLISH_BUTTONS = true;

export default function EditArticlePage() {
  const { id: magId, aid } = useParams<{ id: string; aid: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const art = useQuery({
    queryKey: qk.article(aid),
    queryFn: () => fetchArticle(aid),
  });

  const save = useMutation({
    mutationFn: (data: { title: string; summary?: string; content?: string }) =>
      updateArticle(aid, data),
    onSuccess: async () => {
      toast.success('تم الحفظ');
      await qc.invalidateQueries({ queryKey: qk.article(aid) });
    },
    onError: () => toast.error('تعذّر الحفظ'),
  });

  const pub = useMutation({
    mutationFn: () => publishArticle(aid),
    onSuccess: async () => {
      toast.success('تم النشر');
      await qc.invalidateQueries({ queryKey: qk.article(aid) });
    },
    onError: () => toast.error('تعذّر النشر'),
  });

  const unpub = useMutation({
    mutationFn: () => unpublishArticle(aid),
    onSuccess: async () => {
      toast.success('تم إلغاء النشر');
      await qc.invalidateQueries({ queryKey: qk.article(aid) });
    },
    onError: () => toast.error('تعذّر العملية'),
  });

  const del = useMutation({
    mutationFn: () => deleteArticle(aid),
    onSuccess: () => {
      toast.success('تم حذف المقال');
      router.replace(`/dashboard/magazines/${magId}`);
    },
    onError: () => toast.error('تعذّر الحذف'),
  });

  if (art.isLoading) return <p>جارِ التحميل…</p>;
  if (art.isError || !art.data) return <p>تعذّر تحميل المقال</p>;

  const a = art.data.article; // backend يعيد { article, access }
  const { dir } = getLangDir(a.title, a.summary, a.content);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">تعديل: {a.title}</h1>

        <div className="flex items-center gap-2">
          {SHOW_PUBLISH_BUTTONS &&
            a.status &&
            (a.status === 'PUBLISHED' ? (
              <Button variant="outline" onClick={() => unpub.mutate()} disabled={unpub.isPending}>
                إلغاء النشر
              </Button>
            ) : (
              <Button onClick={() => pub.mutate()} disabled={pub.isPending}>
                نشر
              </Button>
            ))}

          <Button
            variant="outline"
            onClick={() => {
              if (confirm('حذف المقال نهائيًا؟')) del.mutate();
            }}
            disabled={del.isPending}
          >
            حذف
          </Button>

          <Link href={`/dashboard/magazines/${magId}`}>
            <Button variant="outline">رجوع</Button>
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <ArticleForm
          dir={dir}
          initial={{ title: a.title, summary: a.summary, content: a.content }}
          submitting={save.isPending}
          onSubmit={(d) => {
            const payload = {
              title: d.title,
              summary: d.summary ?? undefined,
              content: d.content ?? undefined,
            } satisfies { title: string; summary?: string; content?: string };

            save.mutate(payload);
          }}
        />
      </div>
    </section>
  );
}
