import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THMM - Portfolio',
  description: 'Personal portfolio and projects showcase',
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
