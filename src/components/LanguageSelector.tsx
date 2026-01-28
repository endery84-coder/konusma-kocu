'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Locale } from '@/i18n/config';

interface LanguageSelectorProps {
    variant?: 'dropdown' | 'list' | 'grid';
    showFlags?: boolean;
    className?: string;
}

export function LanguageSelector({
    variant = 'dropdown',
    showFlags = true,
    className = ''
}: LanguageSelectorProps) {
    const {
        currentLocale,
        changeLanguage,
        isPending,
        locales,
        localeNames,
        localeFlags
    } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = async (locale: Locale) => {
        await changeLanguage(locale);
        setIsOpen(false);
    };

    if (variant === 'grid') {
        return (
            <div className={`grid grid-cols-2 gap-3 ${className}`}>
                {locales.map((locale) => (
                    <motion.button
                        key={locale}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(locale)}
                        disabled={isPending}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all
              ${currentLocale === locale
                                ? 'border-teal-500 bg-teal-500/10'
                                : 'border-white/10 bg-white/5 hover:border-teal-500/50'}`}
                    >
                        {showFlags && <span className="text-2xl">{localeFlags[locale]}</span>}
                        <span className={`font-medium ${currentLocale === locale ? 'text-teal-400' : 'text-white'}`}>
                            {localeNames[locale]}
                        </span>
                        {currentLocale === locale && <Check className="w-5 h-5 text-teal-400 ml-auto" />}
                    </motion.button>
                ))}
            </div>
        );
    }

    if (variant === 'list') {
        return (
            <div className={`space-y-2 ${className}`}>
                {locales.map((locale) => (
                    <button
                        key={locale}
                        onClick={() => handleSelect(locale)}
                        disabled={isPending}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all
              ${currentLocale === locale
                                ? 'bg-teal-500/20 border border-teal-500/30'
                                : 'bg-white/5 hover:bg-white/10'}`}
                    >
                        {showFlags && <span className="text-xl">{localeFlags[locale]}</span>}
                        <span className={`font-medium flex-1 text-left ${currentLocale === locale ? 'text-teal-400' : 'text-white'}`}>
                            {localeNames[locale]}
                        </span>
                        {currentLocale === locale && <Check className="w-5 h-5 text-teal-400" />}
                    </button>
                ))}
            </div>
        );
    }

    // Dropdown
    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            >
                {showFlags && <span>{localeFlags[currentLocale]}</span>}
                <span className="text-white text-sm font-medium">{localeNames[currentLocale]}</span>
                <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full mt-2 right-0 z-50 min-w-[160px] bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                        >
                            {locales.map((locale) => (
                                <button
                                    key={locale}
                                    onClick={() => handleSelect(locale)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors
                    ${currentLocale === locale ? 'bg-teal-500/20 text-teal-400' : 'text-white hover:bg-white/5'}`}
                                >
                                    {showFlags && <span>{localeFlags[locale]}</span>}
                                    <span className="text-sm font-medium">{localeNames[locale]}</span>
                                    {currentLocale === locale && <Check className="w-4 h-4 ml-auto" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default LanguageSelector;
