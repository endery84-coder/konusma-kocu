export const locales = ['tr', 'en', 'ar', 'de', 'fa', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

export const localeNames: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    ar: 'العربية',
    de: 'Deutsch',
    fa: 'فارسی',
    ru: 'Русский'
};

export const localeFlags: Record<Locale, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    ar: '🇸🇦',
    de: '🇩🇪',
    fa: '🇮🇷',
    ru: '🇷🇺'
};

export const rtlLocales: Locale[] = ['ar', 'fa'];

export function isRTL(locale: Locale): boolean {
    return rtlLocales.includes(locale);
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
    return isRTL(locale) ? 'rtl' : 'ltr';
}
