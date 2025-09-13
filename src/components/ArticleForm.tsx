'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

export type ArticleFormValues = {
  title: string;
  summary?: string | null;
  content?: string | null;
};

export default function ArticleForm(props: {
  initial?: ArticleFormValues;
  submitting?: boolean;
  onSubmit: (data: ArticleFormValues) => void;
  dir?: 'rtl' | 'ltr';
}) {
  const { initial, submitting, onSubmit, dir = 'rtl' } = props;

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ArticleFormValues>({
    defaultValues: initial ?? { title: '', summary: '', content: '' },
  });

  useEffect(() => {
    if (initial) reset(initial);
  }, [initial, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir={dir}
      className={clsx('space-y-4', dir === 'rtl' ? 'text-right' : 'text-left')}
    >
      <div>
        <label className="text-muted-foreground mb-1 block text-sm">العنوان</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="عنوان المقال"
          {...register('title', { required: true, minLength: 3 })}
        />
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-sm">الملخّص</label>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          placeholder="ملخّص قصير"
          rows={3}
          {...register('summary')}
        />
      </div>

      <div>
        <label className="text-muted-foreground mb-1 block text-sm">المحتوى</label>
        <textarea
          className="w-full rounded-md border px-3 py-2"
          placeholder="نص المقال"
          rows={12}
          {...register('content')}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'جارٍ الحفظ…' : 'حفظ'}
        </Button>
        {!isDirty && <span className="text-muted-foreground text-xs">لا تغييرات بعد</span>}
      </div>
    </form>
  );
}
