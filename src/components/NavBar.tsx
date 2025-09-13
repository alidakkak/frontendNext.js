'use client';

import Link from 'next/link';
import { useAuth } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { logout, user } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';
  const isPublisher = user?.role === 'PUBLISHER';

  return (
    <header className="fixed inset-x-0 top-4 z-50">
      {/* حاوية العرض */}
      <div className="mx-auto max-w-6xl px-4">
        {/* كبسولة زجاجية */}
        <div className="glass-card flex h-16 items-center justify-between rounded-2xl border px-4 shadow-lg backdrop-blur">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            منصّة المجلّات
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link className="hover:underline" href="/">
              الرئيسية
            </Link>
            {!isAdmin && (
              <Link className="hover:underline" href="/subscriptions">
                اشتراكاتي
              </Link>
            )}
            {isAdmin ? (
              <Link className="hover:underline" href="/admin">
                لوحة المدير
              </Link>
            ) : isPublisher ? (
              <Link className="hover:underline" href="/dashboard">
                لوحة الناشر
              </Link>
            ) : null}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground hidden sm:inline">{user.name}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    qc.clear();
                    router.push('/');
                  }}
                >
                  خروج
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-emerald-600 hover:bg-emerald-500">دخول</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
