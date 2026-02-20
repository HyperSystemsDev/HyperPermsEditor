import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Internal Next.js routes
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match locale prefix paths
    '/(de|fr)/:path*',
  ],
};
