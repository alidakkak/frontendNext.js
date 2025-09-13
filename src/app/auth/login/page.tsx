'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

import { login } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('أدخل بريدًا صالحًا'),
  password: z.string().min(6, 'كلمة السر 6 أحرف على الأقل'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (values: Form) => {
    try {
      const res = await login(values.email, values.password);

      auth.login({ token: res.token, user: res.user });

      toast.success('مرحبًا بك!');
      router.push(next);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'بيانات الدخول غير صحيحة';
      toast.error(msg);
    }
  };

  return (
    <section className="mx-auto max-w-md py-10">
      {/* العنوان */}
      <div className="mb-6 text-center">
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">تسجيل الدخول</h1>
        <p className="text-muted-foreground mt-2 text-sm">أدخل بياناتك للمتابعة إلى حسابك.</p>
      </div>

      {/* بطاقة زجاجية بإطار متدرّج */}
      <div className="card-gradient rounded-2xl p-[1px]">
        <div className="glass-card rounded-2xl p-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* البريد */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-60" />
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* كلمة السر */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">كلمة السر</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-60" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className="pr-10 pl-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-zinc-700"
                  aria-label={showPw ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* زر الدخول */}
            <Button
              type="submit"
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500"
              disabled={isSubmitting}
            >
              <LogIn className="ml-2 h-4 w-4" />
              {isSubmitting ? 'جارٍ الدخول…' : 'دخول'}
            </Button>
          </form>

          {/* روابط إضافية */}
          <p className="mt-4 text-center text-sm">
            ليس لديك حساب؟{' '}
            <Link className="text-brand-600 underline underline-offset-4" href="/auth/register">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
