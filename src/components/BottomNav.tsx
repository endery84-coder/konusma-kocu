"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, BarChart3, User, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', icon: Home, label: 'Ana Sayfa' },
    { href: '/exercises', icon: BookOpen, label: 'Egzersizler' },
    { href: '/record', icon: Mic, label: 'Kayıt' },
    { href: '/progress', icon: BarChart3, label: 'İlerleme' },
    { href: '/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50">
            {/* Blur Background */}
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl border-t border-border" />

            <div className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(item.href));

                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className="relative flex flex-col items-center justify-center w-16 h-full group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavBg"
                                    className="absolute inset-1 bg-primary/10 rounded-2xl"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}

                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                        }`}
                                />
                                <span
                                    className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </motion.div>
                        </button>
                    );
                })}
            </div>

            {/* Safe Area Spacer */}
            <div className="h-safe-area-inset-bottom bg-card/80" />
        </nav>
    );
}
