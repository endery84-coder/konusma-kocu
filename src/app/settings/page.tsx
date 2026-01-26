"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Bell, Moon, Sun, Globe, Shield, HelpCircle,
    Star, LogOut, ChevronRight, Volume2, Vibrate, Clock,
    User, Mail, Lock, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [soundEffects, setSoundEffects] = useState(true);
    const [vibration, setVibration] = useState(true);
    const [dailyReminder, setDailyReminder] = useState('09:00');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const settingsSections = [
        {
            title: 'Hesap',
            items: [
                { icon: User, label: 'Profili Düzenle', href: '/settings/profile' },
                { icon: Mail, label: 'Email Değiştir', href: '/settings/email' },
                { icon: Lock, label: 'Şifre Değiştir', href: '/settings/password' },
            ]
        },
        {
            title: 'Tercihler',
            items: [
                {
                    icon: theme === 'dark' ? Moon : Sun,
                    label: 'Karanlık Mod',
                    toggle: true,
                    value: theme === 'dark',
                    onChange: toggleTheme
                },
                {
                    icon: Bell,
                    label: 'Bildirimler',
                    toggle: true,
                    value: notifications,
                    onChange: () => setNotifications(!notifications)
                },
                {
                    icon: Volume2,
                    label: 'Ses Efektleri',
                    toggle: true,
                    value: soundEffects,
                    onChange: () => setSoundEffects(!soundEffects)
                },
                {
                    icon: Vibrate,
                    label: 'Titreşim',
                    toggle: true,
                    value: vibration,
                    onChange: () => setVibration(!vibration)
                },
                {
                    icon: Clock,
                    label: 'Günlük Hatırlatıcı',
                    value: dailyReminder,
                    type: 'time'
                },
                { icon: Globe, label: 'Dil', value: 'Türkçe', href: '/settings/language' },
            ]
        },
        {
            title: 'Destek',
            items: [
                { icon: HelpCircle, label: 'Yardım Merkezi', href: '/help' },
                { icon: Mail, label: 'Bize Ulaşın', href: '/contact' },
                { icon: Star, label: 'Uygulamayı Puanla', action: 'rate' },
            ]
        },
        {
            title: 'Gizlilik',
            items: [
                { icon: Shield, label: 'Gizlilik Politikası', href: '/privacy' },
                { icon: Shield, label: 'Kullanım Şartları', href: '/terms' },
                { icon: Trash2, label: 'Hesabı Sil', href: '/settings/delete', danger: true },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-background pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-border">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">Ayarlar</h1>
                </div>
            </div>

            {/* Settings List */}
            <div className="p-4 space-y-6">
                {settingsSections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.1 }}
                    >
                        <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                            {section.title}
                        </h2>
                        <div className="glass-card rounded-3xl overflow-hidden shadow-soft border border-white/20 dark:border-white/5">
                            {section.items.map((item, itemIndex) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        const i = item as any
                                        if (i.toggle && i.onChange) {
                                            i.onChange();
                                        } else if (i.href) {
                                            router.push(i.href);
                                        } else if (i.action === 'rate') {
                                            window.open('https://play.google.com/store', '_blank');
                                        }
                                    }}
                                    className={`
                    w-full flex items-center justify-between p-4 
                    ${itemIndex !== section.items.length - 1 ? 'border-b border-white/10 dark:border-white/5' : ''}
                    ${(item as any).danger ? 'text-destructive group' : 'text-foreground'}
                    hover:bg-white/50 dark:hover:bg-white/5 transition-colors
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${(item as any).danger ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                                            <item.icon className={`w-5 h-5 ${(item as any).danger ? 'text-destructive' : 'text-primary'}`} />
                                        </div>
                                        <span className={`font-medium ${(item as any).danger ? 'group-hover:text-destructive' : 'text-foreground'}`}>{item.label}</span>
                                    </div>

                                    {(item as any).toggle ? (
                                        <div
                                            className={`
                        w-12 h-7 rounded-full p-1 transition-colors
                        ${(item as any).value ? 'bg-primary' : 'bg-muted'}
                      `}
                                        >
                                            <div
                                                className={`
                          w-5 h-5 bg-white rounded-full shadow-sm transition-transform
                          ${(item as any).value ? 'translate-x-5' : 'translate-x-0'}
                        `}
                                            />
                                        </div>
                                    ) : (item as any).type === 'time' ? (
                                        <input
                                            type="time"
                                            value={(item as any).value}
                                            onChange={(e) => setDailyReminder(e.target.value)}
                                            className="bg-muted/50 px-3 py-1 rounded-lg text-sm border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (item as any).value ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground text-sm font-medium">{(item as any).value}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                        </div>
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-2xl font-semibold hover:bg-destructive/20 transition-colors shadow-none"
                >
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                </motion.button>

                {/* App Version */}
                <p className="text-center text-xs text-muted-foreground pt-4 pb-2">
                    KonuşKoç v1.0.0
                </p>
            </div>

            <BottomNav />
        </div>
    );
}
