'use client';

import { useCallback, useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, locales, localeNames, localeFlags, isRTL } from '@/i18n/config';

export function useLanguage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [currentLocale, setCurrentLocale] = useState<Locale>('tr');

    useEffect(() => {
        // Client-side'da cookie'den dili al
        const cookie = document.cookie.split('; ').find(row => row.startsWith('locale='));
        const locale = cookie?.split('=')[1] as Locale;
        if (locale && locales.includes(locale)) {
            setCurrentLocale(locale);
        }
    }, []);

    const changeLanguage = useCallback(async (newLocale: Locale) => {
        // Cookie'ye kaydet
        document.cookie = `locale=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
        setCurrentLocale(newLocale);

        // Sayfayı yenile
        startTransition(() => {
            router.refresh();
        });
    }, [router]);

    return {
        currentLocale,
        changeLanguage,
        isPending,
        locales,
        localeNames,
        localeFlags,
        isRTL: isRTL(currentLocale),
        direction: isRTL(currentLocale) ? 'rtl' as const : 'ltr' as const
    };
}
