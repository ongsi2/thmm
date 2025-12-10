import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THMM - Portfolio',
  description: 'Personal portfolio and projects showcase',
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
