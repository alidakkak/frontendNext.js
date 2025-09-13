'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, patchAdminUser, qkAdmin } from '@/lib/queries-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const users = useQuery({
    queryKey: qkAdmin.users(page, 20, search),
    queryFn: () => fetchAdminUsers(page, 20, search),
  });

  const mutate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { role?: any; status?: any } }) =>
      patchAdminUser(id, body),
    onSuccess: async () => {
      toast.success('تم التحديث');
      await qc.invalidateQueries({ queryKey: qkAdmin.users(page, 20, search) });
    },
    onError: () => toast.error('تعذّر التحديث'),
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            تحكّم بالأدوار والحالة والبحث السريع.
          </p>
        </div>

        <div className="glass-card flex items-center gap-2 rounded-2xl border px-3 py-2">
          <span className="i-heroicons-magnifying-glass-20-solid opacity-60" />
          <Input
            className="w-56 border-0 bg-transparent focus-visible:ring-0"
            placeholder="بحث بالبريد أو الاسم"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="glass-card rounded-2xl">
        {users.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !users.data?.items.length ? (
          <p className="text-muted-foreground p-6 text-sm">لا يوجد نتائج.</p>
        ) : (
          <div className="divide-y">
            {users.data.items.map((u) => (
              <div
                key={u.id}
                className="hover:bg-accent/40 grid grid-cols-1 gap-4 p-4 transition-colors sm:grid-cols-6 sm:items-center"
              >
                {/* Email + name */}
                <div className="sm:col-span-2">
                  <div className="leading-6 font-semibold">{u.email}</div>
                  <div className="text-muted-foreground mt-0.5 text-xs">{u.name ?? '—'}</div>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">الدور</span>
                  <select
                    className="focus:ring-ring rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                    value={u.role}
                    onChange={(e) => mutate.mutate({ id: u.id, body: { role: e.target.value } })}
                  >
                    <option value="SUBSCRIBER">Subscriber</option>
                    <option value="PUBLISHER">Publisher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">الحالة</span>
                  <select
                    className="focus:ring-ring rounded-lg border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
                    value={u.status}
                    onChange={(e) => mutate.mutate({ id: u.id, body: { status: e.target.value } })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                {/* CreatedAt */}
                <div className="text-muted-foreground text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-end">
                  <Button
                    variant={u.status === 'ACTIVE' ? 'outline' : 'default'}
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      mutate.mutate({
                        id: u.id,
                        body: { status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' },
                      })
                    }
                  >
                    {u.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {users.data && users.data.total > users.data.pageSize && (
          <div className="flex items-center justify-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              السابق
            </Button>
            <div className="bg-muted/60 text-muted-foreground rounded-xl px-3 py-1 text-sm">
              صفحة {page} من {Math.ceil(users.data.total / users.data.pageSize)}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={page >= Math.ceil(users.data.total / users.data.pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
