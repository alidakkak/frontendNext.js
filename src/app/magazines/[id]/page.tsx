'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchMagazine, fetchMagArticles, qk, fetchMyMagazines } from '@/lib/queries';
import { fmtDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';

type MagArtsResult = Awaited<ReturnType<typeof fetchMagArticles>>;
type MagArtItem = MagArtsResult['items'][number];

export default function MagazinePage() {
  const { id } = useParams<{ id: string }>();

  const mag = useQuery({ queryKey: qk.magazine(id), queryFn: () => fetchMagazine(id) });
  const arts = useQuery({
    queryKey: qk.magArticles(id, 1, 10),
    queryFn: () => fetchMagArticles(id, 1, 10),
  });

  if (mag.isLoading || arts.isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-60" />
          <Skeleton className="mx-auto mt-3 h-4 w-80" />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <Skeleton className="mb-3 h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mag.isError || !mag.data) return <p>لم يتم العثور على المجلة</p>;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{mag.data.title}</h1>
        {mag.data.description && (
          <p className="text-muted-foreground mx-auto mt-3 max-w-3xl text-balance">
            {mag.data.description}
          </p>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">المقالات المنشورة</h2>
        {!arts.data?.items.length ? (
          <p>لا توجد مقالات بعد.</p>
        ) : (
          <ul className="space-y-2">
            {arts.data.items.map((a: MagArtItem) => (
              <li key={a.id} className="flex items-baseline gap-3">
                {a.publishedAt && (
                  <span className="text-muted-foreground text-xs">({fmtDate(a.publishedAt)})</span>
                )}
                <Link
                  className="hover:text-brand-600 underline underline-offset-4"
                  href={`/articles/${a.id}`}
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
