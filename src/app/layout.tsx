import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'Digital Magazines',
  description: 'Subscriptions platform (Frontend)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className="light"
      style={{ colorScheme: 'light' }}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-dvh antialiased">
        <Providers>
          <NavBar />

          {/* احجز مساحة = offset(16px) + ارتفاع النافبار(64px) + safe-area-top */}
          <div className="mx-auto max-w-6xl px-4 pt-[calc(env(safe-area-inset-top)+80px)]">
            <main className="py-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
