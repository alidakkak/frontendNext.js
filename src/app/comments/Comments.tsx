'use client';

import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addComment, deleteComment, fetchComments } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fromNow } from '@/lib/format';
import { motion } from 'framer-motion';
import { Trash2, Send, UserRound } from 'lucide-react';
import clsx from 'clsx';

const isArabic = (t?: string) => !!t && /[\u0600-\u06FF]/.test(t);

const PAGE_SIZE = 10;

export default function Comments({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const list = useInfiniteQuery({
    queryKey: ['comments-inf', articleId],
    queryFn: ({ pageParam = 1 }) => fetchComments(articleId, pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((n, p) => n + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  const [body, setBody] = useState('');
  const create = useMutation({
    mutationFn: () => addComment(articleId, body.trim()),
    onSuccess: async () => {
      setBody('');
      await qc.invalidateQueries({ queryKey: ['comments-inf', articleId] });
      toast.success('تم إضافة التعليق');
    },
    onError: () => toast.error('تعذّر إضافة التعليق'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['comments-inf', articleId] });
      toast.success('تم حذف التعليق');
    },
    onError: () => toast.error('تعذّر حذف التعليق'),
  });

  const pages = list.data?.pages ?? [];
  const items = pages.flatMap((p) => p.items);

  return (
    <section className="space-y-4">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">التعليقات</h3>
        <span className="text-muted-foreground text-sm">
          {items.length}
          {list.data?.pages?.[0]?.total ? ` / ${list.data?.pages?.[0]?.total}` : ''}
        </span>
      </div>

      {/* البطاقة الزجاجية */}
      <div className="card-gradient rounded-2xl p-[1px]">
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          {/* نموذج الإضافة */}
          {user ? (
            <div className="mb-5 flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                <UserRound className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1">
                <textarea
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="اكتب تعليقك…"
                  className="w-full resize-y rounded-xl border bg-white/70 px-3 py-2 ring-0 outline-none focus:border-emerald-300 focus:bg-white"
                />
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-500"
                    size="sm"
                    onClick={() => body.trim() && create.mutate()}
                    disabled={create.isPending}
                  >
                    <Send className="mr-1 h-4 w-4" />
                    إرسال
                  </Button>
                  {create.isPending && (
                    <span className="text-muted-foreground text-xs">جارٍ الإرسال…</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground mb-5 text-sm">سجّل الدخول لإضافة تعليق.</p>
          )}

          {/* القائمة */}
          {list.isLoading ? (
            <p>جارِ التحميل…</p>
          ) : !items.length ? (
            <p className="text-muted-foreground text-sm">لا تعليقات بعد.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((c) => {
                const dir = isArabic(c.body) ? 'rtl' : 'ltr';
                const canDelete =
                  user &&
                  (user.id === c.user?.id || user.role === 'ADMIN' || user.role === 'PUBLISHER');

                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border bg-white/60 p-3 sm:p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* العنوان المصغر */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                          {/* الأحرف الأولى من الاسم */}
                          <span className="text-sm font-semibold">
                            {(c.user?.name ?? 'مستخدم').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="leading-5">
                          <div className="text-sm font-medium">{c.user?.name ?? 'مستخدم'}</div>
                          <div className="text-muted-foreground text-xs">
                            {fromNow(c.createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* حذف */}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => remove.mutate(c.id)}
                          disabled={remove.isPending}
                          title="حذف التعليق"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* النص */}
                    <div
                      dir={dir}
                      className={clsx(
                        'mt-3 leading-7 whitespace-pre-wrap',
                        dir === 'rtl' ? 'text-right' : 'text-left',
                      )}
                    >
                      {c.body}
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}

          {/* زر تحميل المزيد */}
          {list.hasNextPage && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
              >
                {list.isFetchingNextPage ? 'جارِ التحميل…' : 'تحميل المزيد'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
