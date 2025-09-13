'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchArticle, qk } from '@/lib/queries';
import GateOverlay from '@/components/GateOverlay';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { getLangDir } from '@/lib/i18n';
import Comments from '@/app/comments/Comments';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: qk.article(id),
    queryFn: () => fetchArticle(id),
  });

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (isError || !data) return <p>تعذّر تحميل المقال</p>;

  const { article, access } = data;
  const { lang, dir } = getLangDir(article.title, article.summary, article.content);
  const hasFull = access === 'FULL' && !!article.content; // 👈 حيازة وصول كامل

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <header className="space-y-3 text-center">
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">
          {article.title}
        </h1>
        {article.summary && (
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
            {article.summary}
          </p>
        )}
      </header>

      {/* المحتوى أو بوابة الاشتراك */}
      {hasFull ? (
        <>
          <article
            lang={lang}
            dir={dir}
            className={clsx(
              'prose prose-neutral prose-article mx-auto max-w-3xl',
              dir === 'rtl' ? 'prose-rtl' : 'prose-ltr',
            )}
          >
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* التعليقات — تظهر للمشتركين فقط */}
          <div className="mt-10">
            <Comments articleId={article.id} />
          </div>
        </>
      ) : (
        <>
          <GateOverlay magId={article.magazineId} onSubscribed={() => refetch()} />

          {/* دلالة واضحة لغير المشتركين */}
          <p className="text-muted-foreground mt-6 text-center text-sm">
            ملاحظة: عرض التعليقات متاح للمشتركين فقط بعد تفعيل الاشتراك.
          </p>
        </>
      )}
    </div>
  );
}
