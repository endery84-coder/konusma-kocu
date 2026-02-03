"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Crown, Flame, Clock, Trophy, ChevronRight, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    router.push('/auth');
                    return;
                }

                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                const { count: exerciseCount } = await supabase
                    .from('user_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', authUser.id);

                const { count: badgeCount } = await supabase
                    .from('user_achievements')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', authUser.id);

                setUser({
                    email: authUser.email,
                    fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || t('common.user'),
                    avatarUrl: profile?.avatar_url || '',
                    isPremium: profile?.is_premium || false,
                    streakDays: profile?.streak_days || 0,
                    totalMinutes: profile?.total_practice_minutes || 0,
                    totalXp: profile?.total_xp || 0,
                    level: profile?.level || 1,
                    completedExercises: exerciseCount || 0,
                    badges: badgeCount || 0,
                });
            } catch {
                // Error handled silently
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router, t]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const stats = [
        { icon: Flame, label: t('progress.streak'), value: user.streakDays, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { icon: Clock, label: t('progress.totalTime'), value: `${Math.round(user.totalMinutes / 60)} ${t('common.hour')}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Trophy, label: t('profile.achievements'), value: user.badges, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ];

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header with gradient */}
            <div className="relative h-40 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500">
                <button
                    onClick={() => router.push('/settings')}
                    className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
                >
                    <Settings className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Profile Card */}
            <div className="px-4 -mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-3xl shadow-lg p-6 border border-border"
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center -mt-16 mb-4">
                        <div className="relative">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.fullName}
                                    className="w-24 h-24 rounded-full border-4 border-card object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-4 border-card bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {getInitials(user.fullName)}
                                    </span>
                                </div>
                            )}
                            <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg">
                                <Camera className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        {/* Premium Badge */}
                        {user.isPremium && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-3 shadow-sm"
                            >
                                <Crown className="w-4 h-4 text-white" />
                                <span className="text-xs font-semibold text-white">Premium</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Name & Email */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-foreground">{user.fullName}</h1>
                        <p className="text-muted-foreground text-sm">{user.email}</p>
                        <p className="text-primary text-sm mt-1 font-medium">
                            {t('onboarding.levelTitle')} {user.level} • {user.totalXp} XP
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${stat.bg} rounded-2xl p-4 text-center`}
                            >
                                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Premium CTA */}
                {!user.isPremium && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => router.push('/premium')}
                        className="w-full mt-4 p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-between shadow-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-white">{t('home.premium.button') || 'Premium\'a Geç'}</p>
                                <p className="text-sm text-white/80">{t('home.premium.desc') || 'Tüm özelliklere eriş'}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white" />
                    </motion.button>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 bg-card rounded-2xl border border-border overflow-hidden"
                >
                    {[
                        { label: t('achievements.title') || 'Başarılar', href: '/achievements' },
                        { label: t('leaderboard.title') || 'Sıralama', href: '/leaderboard' },
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.items.help'), href: '/help' },
                    ].map((item, index) => (
                        <button
                            key={item.label}
                            onClick={() => item.href !== '#rate' && router.push(item.href)}
                            className={`w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors
                ${index !== 2 ? 'border-b border-border' : ''}`}
                        >
                            <span className="font-medium text-foreground">{item.label}</span>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                    ))}
                </motion.div>
            </div>


        </div>
    );
}
