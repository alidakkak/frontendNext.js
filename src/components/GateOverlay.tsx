'use client';

import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { subscribe } from '@/lib/queries';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function GateOverlay({
  magId,
  onSubscribed,
}: {
  magId: string;
  onSubscribed?: () => void;
}) {
  const m = useMutation({
    mutationFn: () => subscribe(magId),
    onSuccess: (res) => {
      toast.success(res.alreadyActive ? 'لديك اشتراك نشط' : 'تم الاشتراك بنجاح');
      onSubscribed?.();
    },
    onError: () => toast.error('تعذّر تنفيذ الاشتراك'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-gradient rounded-2xl p-[1px]"
    >
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
            <Lock className="h-5 w-5 text-emerald-700" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">هذا المحتوى متاح للمشتركين فقط</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                احصل على وصول فوري للمقال بالكامل وجميع أعداد المجلّة.
              </p>
            </div>

            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                'قراءة غير محدودة لمحتوى هذه المجلّة',
                'إشعارات عند نشر مقالات جديدة',
                'دعم الكتّاب والناشر',
                'إمكانية إضافة تعليقات',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => m.mutate()}
                disabled={m.isPending}
                className="bg-emerald-600 shadow-md hover:bg-emerald-500"
              >
                اشترك الآن
              </Button>

              <Button asChild variant="outline">
                <Link href={`/magazines/${magId}`}>تفاصيل المجلّة</Link>
              </Button>

              {m.isPending && (
                <span className="text-muted-foreground text-xs">جارٍ تنفيذ العملية…</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
