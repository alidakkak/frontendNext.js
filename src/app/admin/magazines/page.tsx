'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  qkAdminMag,
  fetchAdminMagazines,
  patchAdminMagazine,
  deleteAdminMagazine,
  createAdminMagazine,
} from '@/lib/queries-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function Modal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />
      <div className="absolute top-1/2 left-1/2 w-[min(96vw,640px)] -translate-x-1/2 -translate-y-1/2">
        <div className="bg-background rounded-2xl border shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="text-lg font-semibold">{props.title}</h3>
            <button
              className="hover:bg-accent rounded-md px-2 py-1 text-sm opacity-70"
              onClick={props.onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="px-5 py-4">{props.children}</div>
        </div>
      </div>
    </div>
  );
}

type MagazineFormValues = {
  title: string;
  description?: string;
  coverUrl?: string;
};

function MagazineForm(props: {
  initial?: MagazineFormValues;
  submitting?: boolean;
  onSubmit: (values: MagazineFormValues) => void;
}) {
  const [form, setForm] = useState<MagazineFormValues>({
    title: props.initial?.title ?? '',
    description: props.initial?.description ?? '',
    coverUrl: props.initial?.coverUrl ?? '',
  });

  const coverPreview = form.coverUrl?.trim();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(form);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-sm">العنوان</label>
          <Input
            placeholder="عنوان المجلّة"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-sm">الوصف</label>
          <textarea
            className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
            placeholder="وصف موجز عن المجلّة"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-sm">رابط صورة الغلاف</label>
          <Input
            placeholder="https://…"
            value={form.coverUrl}
            onChange={(e) => setForm((s) => ({ ...s, coverUrl: e.target.value }))}
          />
          {coverPreview && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreview}
                alt="preview"
                className="h-28 w-full rounded-lg object-cover"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={props.submitting} className="rounded-xl">
          {props.submitting ? 'جارٍ الحفظ…' : 'حفظ'}
        </Button>
      </div>
    </form>
  );
}

export default function AdminMagazinesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [current, setCurrent] = useState<any | null>(null);

  const qc = useQueryClient();

  const mags = useQuery({
    queryKey: qkAdminMag.list(page, 12, search),
    queryFn: () => fetchAdminMagazines(page, 12, search),
  });

  const mCreate = useMutation({
    mutationFn: (values: MagazineFormValues) => createAdminMagazine(values),
    onSuccess: async () => {
      toast.success('تم إنشاء المجلّة');
      setOpen(false);
      setCurrent(null);
      await qc.invalidateQueries({ queryKey: qkAdminMag.list(page, 12, search) });
    },
    onError: () => toast.error('تعذّر الإنشاء'),
  });

  const mUpdate = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MagazineFormValues }) =>
      patchAdminMagazine(id, body),
    onSuccess: async () => {
      toast.success('تم تحديث المجلّة');
      setOpen(false);
      setCurrent(null);
      await qc.invalidateQueries({ queryKey: qkAdminMag.list(page, 12, search) });
    },
    onError: () => toast.error('تعذّر التحديث'),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAdminMagazine(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: async () => {
      toast.success('تم حذف المجلّة');
      const total = mags.data?.total ?? 0;
      const remaining = total - 1 - (page - 1) * 12;
      if (page > 1 && remaining <= 0) setPage(page - 1);
      await qc.invalidateQueries({ queryKey: qkAdminMag.list(page, 12, search) });
    },
    onError: () => toast.error('تعذّر الحذف'),
    onSettled: () => setDeletingId(null),
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">إدارة المجلّات</h1>
          <p className="text-muted-foreground mt-1 text-sm">إضافة، تعديل، حذف.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="glass-card flex items-center gap-2 rounded-2xl border px-3 py-2">
            <Input
              className="w-56 border-0 bg-transparent focus-visible:ring-0"
              placeholder="بحث بالعنوان"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Button
            className="rounded-xl"
            onClick={() => {
              setMode('create');
              setCurrent(null);
              setOpen(true);
            }}
          >
            + إضافة مجلّة
          </Button>
        </div>
      </div>

      {/* قائمة */}
      <div className="glass-card rounded-2xl">
        {mags.isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : mags.isError ? (
          <p className="text-destructive p-6 text-sm">تعذّر تحميل المجلّات.</p>
        ) : !mags.data?.items.length ? (
          <div className="p-8 text-center">
            <div className="text-lg font-semibold">لا توجد نتائج</div>
          </div>
        ) : (
          <div className="divide-y">
            {mags.data.items.map((m: any) => (
              <div
                key={m.id}
                className="hover:bg-accent/40 grid grid-cols-1 gap-4 p-4 sm:grid-cols-5 sm:items-center"
              >
                <div className="sm:col-span-2">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {m.description ?? '—'}
                  </div>
                </div>

                <div>
                  {m.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.coverUrl} alt="" className="h-12 w-20 rounded-md object-cover" />
                  ) : (
                    <div className="bg-muted h-12 w-20 rounded-md" />
                  )}
                </div>

                <div className="text-muted-foreground text-xs">
                  {new Date(m.createdAt).toLocaleDateString()}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMode('edit');
                      setCurrent(m);
                      setOpen(true);
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!deletingId && confirm('حذف المجلّة نهائيًا؟')) del.mutate(m.id);
                    }}
                    disabled={deletingId === m.id}
                  >
                    {deletingId === m.id ? 'جارٍ الحذف…' : 'حذف'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === 'create' ? 'إضافة مجلّة' : 'تعديل مجلّة'}
      >
        <MagazineForm
          initial={
            mode === 'edit' && current
              ? {
                  title: current.title,
                  description: current.description ?? '',
                  coverUrl: current.coverUrl ?? '',
                }
              : undefined
          }
          submitting={mCreate.isPending || mUpdate.isPending}
          onSubmit={(values) => {
            if (mode === 'create') mCreate.mutate(values);
            else if (mode === 'edit' && current?.id)
              mUpdate.mutate({ id: current.id, body: values });
          }}
        />
      </Modal>
    </section>
  );
}
