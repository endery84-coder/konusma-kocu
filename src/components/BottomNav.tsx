"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, Dumbbell, Mic, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useLanguage();

    const navItems = [
        { href: '/', icon: Home, label: t('nav.home') },
        { href: '/exercises', icon: Dumbbell, label: t('nav.exercises') },
        { href: '/record', icon: Mic, label: t('nav.record'), isMain: true },
        { href: '/progress', icon: TrendingUp, label: t('nav.progress') },
        { href: '/profile', icon: User, label: t('nav.profile') },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="max-w-[430px] mx-auto pointer-events-auto">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-white/20 dark:border-white/5 pb-safe">
                    <div className="flex justify-around items-center h-16 relative">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;

                            if (item.isMain) {
                                return (
                                    <motion.button
                                        key={item.href}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => router.push(item.href)}
                                        className="relative -top-6 bg-gradient-to-tr from-teal-400 to-cyan-400 p-4 rounded-full shadow-lg border-4 border-white dark:border-slate-950 flex flex-col items-center justify-center gap-1 group"
                                    >
                                        <item.icon className="w-6 h-6 text-white" />
                                        <span className="text-[10px] font-medium text-white/90 absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </motion.button>
                                );
                            }

                            return (
                                <button
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors relative
                    ${isActive ? 'text-teal-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
                  `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-2 w-1 h-1 bg-teal-500 rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
