import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !hasLocale(locales, locale)) {
    locale = defaultLocale;
  }

  const common = (await import(`../messages/${locale}/common.json`)).default;
  const editor = (await import(`../messages/${locale}/editor.json`)).default;

  return {
    locale,
    messages: {
      ...common,
      editor,
    },
  };
});
