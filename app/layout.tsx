import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THMM - 신성무 | 풀스택 개발자 포트폴리오',
  description: 'NestJS, Next.js, Redis, Docker를 활용한 실서비스 구축 경험. 백엔드/프론트엔드 풀스택 개발자 신성무의 프로젝트 포트폴리오.',
  keywords: ['풀스택 개발자', 'NestJS', 'Next.js', 'TypeScript', 'Redis', 'Docker', '백엔드', '프론트엔드', '포트폴리오'],
  authors: [{ name: '신성무' }],
  icons: [
    { rel: 'icon', url: '/favicon.svg' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
