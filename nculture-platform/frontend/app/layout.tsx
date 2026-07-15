import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Coming AI - AI 콘텐츠 교육 플랫폼',
  description: 'AI 영상 제작부터 디지털 휴먼까지, 체계적인 AI 콘텐츠 창작 교육',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white min-h-screen">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
