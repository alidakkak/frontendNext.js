'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAdminOverview, qkAdmin } from '@/lib/queries-admin';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: qkAdmin.overview,
    queryFn: fetchAdminOverview,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (isError || !data) return <p>تعذّر تحميل الإحصائيات</p>;

  const cards = [
    { label: 'المستخدمون', value: data.users },
    { label: 'المجلّات', value: data.magazines },
    { label: 'المقالات', value: data.articles },
    { label: 'اشتراكات نشطة', value: data.activeSubs },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">لوحة المدير</h1>
          <p className="text-muted-foreground mt-1 text-sm">نظرة سريعة على مؤشرات المنصّة.</p>
        </div>

        <a
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
          href="/admin/users"
        >
          إدارة المستخدمين
          <span className="opacity-60">→</span>
        </a>

        <a
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
          href="/admin/magazines"
        >
          إدارة المجلات
          <span className="opacity-60">→</span>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="glass-card group ring-border/60 rounded-2xl p-5 ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-muted-foreground text-sm">{c.label}</div>
            <div className="mt-2 text-4xl font-black tracking-tight">{c.value}</div>
            <div className="bg-foreground/10 mt-3 h-1 w-10 origin-left scale-x-100 rounded-full transition-all group-hover:w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}
