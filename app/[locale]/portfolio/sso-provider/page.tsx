import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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
