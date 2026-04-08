// ─── VanJet · i18n Request Handler ─────────────────────────────
// Server-side locale resolution for Next.js App Router + next-intl
// Reads locale from NEXT_LOCALE cookie with fallback to Arabic

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, isValidLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  // Read locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  // Validate and fallback to default
  const locale: Locale = localeCookie && isValidLocale(localeCookie) 
    ? localeCookie 
    : defaultLocale;

  let messages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    // Fallback to Arabic if translation file is missing
    console.warn(`[i18n] Missing messages for locale: ${locale}, falling back to ${defaultLocale}`);
    try {
      messages = (await import(`./messages/${defaultLocale}.json`)).default;
    } catch {
      // Development fallback - empty messages
      console.error('[i18n] No message files found');
      messages = {};
    }
  }

  return {
    locale,
    messages,
    // Return key in development, empty string in production for missing keys
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[i18n]', error.message);
      }
    },
    getMessageFallback: ({ key, namespace }) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      if (process.env.NODE_ENV === 'development') {
        return `[${fullKey}]`;
      }
      return '';
    },
  };
});
