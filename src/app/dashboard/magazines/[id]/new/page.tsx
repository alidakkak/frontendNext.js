'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { createArticle } from '@/lib/queries';
import ArticleForm from '@/components/ArticleForm';
import { toast } from 'sonner';
import { getLangDir } from '@/lib/i18n';

export default function NewArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const m = useMutation({
    mutationFn: (data: { title: string; summary?: string; content?: string }) =>
      createArticle(id, { ...data, status: 'PUBLISHED' }),
    onSuccess: (res) => {
      toast.success('تم إنشاء المسودّة');
      router.replace(`/magazines/${id}`);
    },
    onError: () => toast.error('تعذّر الإنشاء'),
  });

  const { dir } = getLangDir();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">مقال جديد</h1>
      <div className="glass-card rounded-2xl p-6">
        <ArticleForm
          dir={dir}
          submitting={m.isPending}
          onSubmit={(d) =>
            m.mutate({
              title: d.title,
              summary: d.summary ?? undefined,
              content: d.content ?? undefined,
            })
          }
        />
      </div>
    </section>
  );
}
