"use client";

import { Check, ArrowLeft, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Language } from '@/lib/i18n/translations';

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
];

export default function LanguageSettingsPage() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    const handleLanguageSelect = (code: Language) => {
        setLanguage(code);
        setTimeout(() => {
            router.back();
        }, 300);
    };

    return (
        <div className="min-h-screen bg-background pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-border">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">{t('settings.items.language')}</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="glass-card rounded-3xl overflow-hidden shadow-soft border border-white/20 dark:border-white/5">
                    {languages.map((lang, index) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            className={`
                w-full flex items-center justify-between p-4 
                ${index !== languages.length - 1 ? 'border-b border-white/10 dark:border-white/5' : ''}
                hover:bg-white/50 dark:hover:bg-white/5 transition-colors
                `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center text-lg">
                                    {lang.flag}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-foreground">{lang.nativeName}</p>
                                    <p className="text-xs text-muted-foreground">{lang.name}</p>
                                </div>
                            </div>

                            {language === lang.code && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-4 h-4 text-primary-foreground" />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </div>

                <p className="text-center text-sm text-muted-foreground px-4">
                    {language === 'tr' ? 'Uygulama dili değiştirildiğinde tüm menüler ve içerikler seçilen dilde görüntülenecektir.' : 'When app language is changed, all menus and content will be displayed in the selected language.'}
                </p>
            </div>
        </div>
    );
}
