'use client';

import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Newspaper, CheckCircle2 } from 'lucide-react';

import { registerUser, login } from '@/lib/queries';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(' ');
}

const schema = z
  .object({
    name: z.string().min(2, 'الاسم يجب أن لا يقل عن حرفين').max(80, 'الاسم طويل جدًا'),
    email: z.string().email('أدخل بريدًا صالحًا'),
    password: z.string().min(6, 'كلمة السر 6 أحرف على الأقل').max(100, 'كلمة السر طويلة جدًا'),
    confirmPassword: z.string(),
    role: z.enum(['PUBLISHER', 'SUBSCRIBER'], 'اختر الدور'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'كلمتا السر غير متطابقتين',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return (score / 5) * 100; // 0..100
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'SUBSCRIBER' },
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const pw = watch('password');
  const strength = useMemo(() => passwordStrength(pw || ''), [pw]);

  const onSubmit = async (values: Form) => {
    try {
      const { name, email, password, role } = values;

      const regRes = await registerUser({ name, email, password, role });

      if (regRes?.token && regRes?.user) {
        auth.login({ token: regRes.token, user: regRes.user });
        toast.success('تم إنشاء الحساب وتسجيل الدخول 👋');
        router.push(next);
        return;
      }

      try {
        const loginRes = await login(email, password);
        auth.login({ token: loginRes.token, user: loginRes.user });
        toast.success('تم إنشاء الحساب وتسجيل الدخول 👋');
        router.push(next);
      } catch {
        toast.success('تم إنشاء الحساب. الرجاء تسجيل الدخول.');
        router.push('/(auth)/login?next=' + encodeURIComponent(next));
      }
    } catch (e: any) {
      const msg = e?.message || 'تعذّر إنشاء الحساب';
      toast.error(msg);
    }
  };

  return (
    <section className="mx-auto max-w-md py-10">
      {/* العنوان */}
      <div className="mb-6 text-center">
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">إنشاء حساب</h1>
        <p className="text-muted-foreground mt-2 text-sm">اختر دورك وأكمل بياناتك للبدء.</p>
      </div>

      {/* البطاقة */}
      <div className="card-gradient rounded-2xl p-[1px]">
        <div className="glass-card rounded-2xl p-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* اختيار الدور (Radio Cards) */}
            <div>
              <label className="mb-2 block text-sm font-medium">الدور</label>

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div role="radiogroup" aria-label="اختر الدور" className="grid grid-cols-2 gap-3">
                    {/* Subscriber */}
                    <label
                      className={cn(
                        'relative cursor-pointer rounded-2xl border p-4 transition-all',
                        field.value === 'SUBSCRIBER'
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                          : 'border-border hover:bg-accent/50',
                      )}
                      aria-checked={field.value === 'SUBSCRIBER'}
                    >
                      <input
                        type="radio"
                        value="SUBSCRIBER"
                        checked={field.value === 'SUBSCRIBER'}
                        onChange={() => field.onChange('SUBSCRIBER')}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-5 w-5 opacity-70" />
                        <div>
                          <div className="font-semibold">مشترك (Subscriber)</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            قراءة واشتراك بالمجلّات، بدون صلاحية النشر.
                          </p>
                        </div>
                      </div>
                      {field.value === 'SUBSCRIBER' && (
                        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-emerald-600" />
                      )}
                    </label>

                    {/* Publisher */}
                    <label
                      className={cn(
                        'relative cursor-pointer rounded-2xl border p-4 transition-all',
                        field.value === 'PUBLISHER'
                          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-200'
                          : 'border-border hover:bg-accent/50',
                      )}
                      aria-checked={field.value === 'PUBLISHER'}
                    >
                      <input
                        type="radio"
                        value="PUBLISHER"
                        checked={field.value === 'PUBLISHER'}
                        onChange={() => field.onChange('PUBLISHER')}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <Newspaper className="mt-0.5 h-5 w-5 opacity-70" />
                        <div>
                          <div className="font-semibold">ناشر (Publisher)</div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            إنشاء وإدارة مقالات ومجلّات بحسب الصلاحيات.
                          </p>
                        </div>
                      </div>
                      {field.value === 'PUBLISHER' && (
                        <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-emerald-600" />
                      )}
                    </label>
                  </div>
                )}
              />
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}

              {/* بديل مبسّط (اختياري): قائمة منسدلة */}
              {/* <select {...register('role')} className="mt-2 w-full rounded-lg border px-2 py-2 text-sm">
                <option value="SUBSCRIBER">Subscriber</option>
                <option value="PUBLISHER">Publisher</option>
              </select> */}
            </div>

            {/* الاسم */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">الاسم</label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-60" />
                <Input
                  type="text"
                  autoComplete="name"
                  placeholder="الاسم الكامل"
                  aria-invalid={!!errors.name}
                  className="pl-9"
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

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
                  autoComplete="new-password"
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

              {/* مؤشر القوة */}
              <div className="bg-muted mt-2 h-1.5 w-full rounded-full">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${strength}%`,
                    background: strength < 40 ? '#ef4444' : strength < 70 ? '#f59e0b' : '#10b981',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                يفضّل أن تحتوي كلمة السر على أحرف كبيرة وصغيرة وأرقام ورمز خاص.
              </p>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* تأكيد كلمة السر */}
            <div>
              <label className="text-muted-foreground mb-1 block text-sm">تأكيد كلمة السر</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 opacity-60" />
                <Input
                  type={showPw2 ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                  className="pr-10 pl-9"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-zinc-700"
                  aria-label={showPw2 ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* زر الإنشاء */}
            <Button
              type="submit"
              className="mt-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500"
              disabled={isSubmitting}
            >
              <UserPlus className="ml-2 h-4 w-4" />
              {isSubmitting ? 'جارٍ إنشاء الحساب…' : 'إنشاء حساب'}
            </Button>
          </form>

          {/* روابط */}
          <p className="mt-4 text-center text-sm">
            لديك حساب؟{' '}
            <Link className="text-brand-600 underline underline-offset-4" href="/(auth)/login">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
