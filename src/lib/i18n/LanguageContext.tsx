"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

type Translations = typeof translations.tr;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');

    useEffect(() => {
        // Load from localStorage on mount
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && (translations as any)[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);

        // Update document direction for RTL support
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
    };

    const t = (path: string, params?: Record<string, string | number>): string => {
        const keys = path.split('.');
        let current: any = (translations as any)[language] || translations.tr;

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path}`);
                return path;
            }
            current = current[key];
        }

        let result = current as string;

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                result = result.replace(`{${key}}`, String(value));
            });
        }

        return result;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            isRTL: language === 'ar'
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
