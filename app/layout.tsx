import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://thmm.kr';
const siteName = 'THMM Portfolio';
const siteTitle = '신성무 | 시니어 풀스택 개발자 | Spring Boot·NestJS·Next.js·Redis 포트폴리오';
const siteDescription = '풀스택 개발자 신성무의 포트폴리오 | Java·Spring Boot·NestJS·Next.js·TypeScript·Redis·Docker | CI/CD 파이프라인 구축 | 배포 시간 83% 단축 실적 | 실서비스 운영 경험';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    '풀스택 개발자',
    '시니어 개발자',
    'Spring Boot',
    'NestJS',
    'Next.js',
    'TypeScript',
    'Redis',
    'Docker',
    'CI/CD',
    'Jenkins',
    '백엔드',
    '프론트엔드',
    '포트폴리오',
    '신성무',
  ],
  authors: [{ name: '신성무', url: siteUrl }],
  creator: '신성무',
  publisher: '신성무',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteUrl,
    siteName: siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: '신성무 | 풀스택 개발자 포트폴리오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [`${siteUrl}/og-image.jpg`],
  },
  verification: {
    google: 'JsspUkmTqguJNpukyCl2P1Je3L5LBvDtWB4PrjbMpWA',
  },
  alternates: {
    canonical: siteUrl,
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: '신성무',
  alternateName: 'THMM',
  jobTitle: '풀스택 개발자',
  url: siteUrl,
  email: 'ongsya@gmail.com',
  description: '10년 경력의 풀스택 개발자. Java, Spring Boot, Node.js, NestJS 전문',
  knowsAbout: [
    'Java',
    'Spring Boot',
    'Node.js',
    'NestJS',
    'Next.js',
    'TypeScript',
    'Redis',
    'Docker',
    'PostgreSQL',
    'MySQL',
    'Oracle',
    'CI/CD',
    'Jenkins',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: '풀스택 개발자',
    occupationLocation: {
      '@type': 'Country',
      name: '대한민국',
    },
    estimatedSalary: {
      '@type': 'MonetaryAmountDistribution',
      name: '시니어 개발자',
    },
  },
  alumniOf: [
    {
      '@type': 'Organization',
      name: 'NHN엔터테인먼트',
    },
    {
      '@type': 'Organization',
      name: '아이티파트너스',
    },
  ],
  worksFor: {
    '@type': 'Organization',
    name: '한국언론진흥재단',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  alternateName: '신성무 포트폴리오',
  url: siteUrl,
  description: '풀스택 개발자 신성무의 포트폴리오 사이트',
  inLanguage: 'ko-KR',
};

const profilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: '신성무',
    jobTitle: '풀스택 개발자',
    description: '10년 경력 | Spring Boot, NestJS, Next.js 전문 | 실서비스 운영 경험',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
