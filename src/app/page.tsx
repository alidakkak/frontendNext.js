'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchMagazines, qk } from '@/lib/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.magazines(1, 12),
    queryFn: () => fetchMagazines(1, 12),
  });

  if (isLoading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-7 w-28" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card overflow-hidden rounded-2xl border">
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-3 h-40 w-full" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="mt-4 text-end">
                  <Skeleton className="inline-block h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) return <p>حدث خطأ في جلب البيانات</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">المجلّات</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((m) => (
          <Card
            key={m.id}
            className="glass-card group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <CardHeader>
              <CardTitle className="text-center text-lg font-semibold">{m.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {m.coverUrl && (
                <div className="mb-3 overflow-hidden rounded-xl">
                  <Image
                    src={m.coverUrl}
                    alt={m.title}
                    width={640}
                    height={360}
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}

              {m.description && (
                <p className="text-muted-foreground line-clamp-3 text-sm">{m.description}</p>
              )}

              <div className="mt-4 text-end">
                <Link
                  className="text-brand-600 inline-flex items-center gap-1 hover:underline"
                  href={`/magazines/${m.id}`}
                >
                  عرض المجلّة →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
