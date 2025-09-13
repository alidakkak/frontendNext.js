'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { fetchMyMagazines, qk } from '@/lib/queries';
import { useAuth } from '@/stores/auth';

type MyMagsResult = Awaited<ReturnType<typeof fetchMyMagazines>>;
type MyMagItem = MyMagsResult['items'][number];

export default function DashboardHome() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.myMags?.(1, 20) ?? ['my-mags', 1, 20],
    queryFn: () => fetchMyMagazines(1, 20),
  });

  if (!user || (user.role !== 'PUBLISHER' && user.role !== 'ADMIN')) {
    return (
      <p className="text-muted-foreground text-center text-sm">هذه الصفحة للناشر/المدير فقط.</p>
    );
  }

  if (isLoading) return <p>جارِ التحميل…</p>;
  if (isError || !data) return <p>تعذّر جلب المجلّات</p>;

  return (
    <section className="space-y-6">
      <header className="text-center">
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">لوحة الناشر</h1>
        <p className="text-muted-foreground">إدارة مجلّاتك ومقالاتك</p>
      </header>

      {!data.items.length ? (
        <div className="glass-card rounded-2xl p-6 text-center">لا توجد مجلّات مرتبطة بحسابك.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((m: MyMagItem) => (
            <div key={m.id} className="glass-card overflow-hidden rounded-2xl">
              {m.coverUrl && (
                <Image
                  src={m.coverUrl}
                  alt={m.title}
                  width={640}
                  height={360}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-center text-lg font-semibold">{m.title}</h3>
                {m.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{m.description}</p>
                )}
                <div className="mt-4 text-end">
                  <Link
                    href={`/dashboard/magazines/${m.id}`}
                    className="text-brand-600 underline underline-offset-4"
                  >
                    إدارة المجلّة →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
