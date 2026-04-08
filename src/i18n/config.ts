// ─── VanJet · i18n Configuration ────────────────────────────────
// Centralized locale configuration for the admin panel
// Default: Arabic (ar) with RTL support

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export const localeNames: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

/**
 * Type guard to check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the direction for a given locale
 */
export function getDirection(locale: Locale): 'rtl' | 'ltr' {
  return localeDirections[locale];
}

/**
 * Get locale from cookie value with fallback
 */
export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }
  return defaultLocale;
}
