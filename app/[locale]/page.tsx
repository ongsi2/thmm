import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import HomeClient from './_HomeClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  const canonical = locale === 'ko' ? '/' : '/en';
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {
        'ko-KR': '/',
        'en-US': '/en',
        'x-default': '/',
      },
    },
    openGraph: {
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      title: t('title'),
      description: t('description'),
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function Page() {
  return <HomeClient />;
}
