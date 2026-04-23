import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.techtradeMigration' });
  const path = '/portfolio/techtrade-migration';
  const canonical = locale === 'ko' ? path : `/en${path}`;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
      languages: {
        'ko-KR': path,
        'en-US': `/en${path}`,
        'x-default': path,
      },
    },
    openGraph: {
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
      alternateLocale: locale === 'ko' ? 'en_US' : 'ko_KR',
      title: t('title'),
      description: t('description'),
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const Content = locale === 'en'
    ? (await import('./content.en')).default
    : (await import('./content.ko')).default;
  return <Content />;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
