'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchMySubscriptions, qk } from '@/lib/queries';
import { fmtDate, statusText } from '@/lib/format';
import { useAuth } from '@/stores/auth';

type MySubsResult = Awaited<ReturnType<typeof fetchMySubscriptions>>;
type MySubItem = MySubsResult['items'][number];

function StatusBadge({ s }: { s: 'ACTIVE' | 'EXPIRED' | 'CANCELED' }) {
  const cls =
    s === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : s === 'EXPIRED'
        ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
        : 'bg-rose-50 text-rose-700 border-rose-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {statusText(s)}
    </span>
  );
}

export default function MySubscriptionsPage() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/auth/login');
  }, [token, router]);

  const { data, isLoading, isError } = useQuery({
    queryKey: qk.mySubs?.(1, 20) ?? ['subs-me', 1, 20],
    queryFn: () => fetchMySubscriptions(1, 20),
    enabled: !!token,
  });

  if (!token) return null;
  if (isLoading) return <p>جارِ التحميل…</p>;
  if (isError || !data) return <p>تعذّر جلب الاشتراكات</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">اشتراكاتي</h1>

      {!data.items.length ? (
        <div className="glass-card rounded-2xl p-6">
          <p>لا يوجد لديك اشتراكات بعد.</p>
          <p className="text-muted-foreground mt-2 text-sm">
            تصفّح{' '}
            <Link href="/" className="underline">
              المجلّات
            </Link>{' '}
            وابدأ الاشتراك.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="grid grid-cols-1 divide-y">
            {data.items.map((sub: MySubItem) => (
              <div
                key={sub.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* المجلّة */}
                <div className="flex items-center gap-3">
                  {sub.magazine.coverUrl && (
                    <div className="overflow-hidden rounded-md">
                      <Image
                        src={sub.magazine.coverUrl}
                        alt={sub.magazine.title}
                        width={80}
                        height={56}
                        className="h-14 w-20 object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <Link
                      href={`/magazines/${sub.magazine.id}`}
                      className="font-medium hover:underline"
                    >
                      {sub.magazine.title}
                    </Link>
                    <div className="text-muted-foreground mt-1 text-xs">
                      بدء: {fmtDate(sub.startAt)} • انتهاء: {fmtDate(sub.endAt)}
                    </div>
                  </div>
                </div>

                {/* الحالة والعمليات */}
                <div className="flex items-center gap-3">
                  <StatusBadge s={sub.status} />
                  <Link
                    href={`/magazines/${sub.magazine.id}`}
                    className="text-brand-600 underline underline-offset-4"
                  >
                    الذهاب للمجلّة
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
