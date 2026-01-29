"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings, Award, Calendar,
    BarChart2, Edit3, LogOut, ChevronRight, Target
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { supabase } from '@/lib/supabase';
import { badges } from '@/lib/data/badges';
import BottomNav from '@/components/BottomNav';
import { useBadgeSystem } from '@/hooks/useBadgeSystem';

const WeeklyActivityChart = dynamic(() => import('@/components/WeeklyActivityChart'), { ssr: false });
const SkillsMapChart = dynamic(() => import('@/components/SkillsMapChart'), { ssr: false });

interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    created_at: string;
    streak_days: number;
    total_xp: number;
    firstName: string;
    joinDate: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useBadgeSystem(user, setUser, t);

    // Mock Data for Charts (Later connected to DB)
    const weeklyData = [
        { name: 'Pzt', min: 12 },
        { name: 'Sal', min: 25 },
        { name: 'Çar', min: 18 },
        { name: 'Per', min: 30 },
        { name: 'Cum', min: 15 },
        { name: 'Cmt', min: 45 },
        { name: 'Paz', min: 20 },
    ];

    const skillData = [
        { subject: 'Nefes', A: 80, fullMark: 100 },
        { subject: 'Diksiyon', A: 65, fullMark: 100 },
        { subject: 'Hız', A: 90, fullMark: 100 },
        { subject: 'Vurgu', A: 70, fullMark: 100 },
        { subject: 'Kelime', A: 50, fullMark: 100 },
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) {
                    router.push('/welcome');
                    return;
                }

                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                setUser({
                    ...profile,
                    firstName: profile?.full_name?.split(' ')[0] || t('common.user'),
                    joinDate: new Date(profile?.created_at || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' })
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/welcome');
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="w-full px-6 py-8 flex justify-between items-start bg-card border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                        {user?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{user?.full_name || t('common.user')}</h1>
                        <p className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3" /> {t('profile.joined')} {user?.joinDate}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/settings')}
                    className="p-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                >
                    <Settings className="w-5 h-5 text-foreground" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-2xl font-black text-foreground">{user?.streak_days || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase">{t('progress.streak')}</span>
                    </div>
                    <div className="bg-card p-4 rounded-2xl border border-border flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-2xl font-black text-foreground">{user?.total_xp || 0}</span>
                        <span className="text-xs text-muted-foreground uppercase">XP</span>
                    </div>
                </div>

                {/* Analysis Charts */}
                <div className="bg-card p-5 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-foreground">{t('progress.weeklyActivity')}</h3>
                    </div>
                    <div className="h-48 w-full">
                        <WeeklyActivityChart data={weeklyData} />
                    </div>
                </div>

                <div className="bg-card p-5 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-accent" />
                        <h3 className="font-bold text-foreground">{t('progress.skillsMap')}</h3>
                    </div>
                    <div className="h-56 w-full -ml-4">
                        <SkillsMapChart data={skillData} />
                    </div>
                </div>

                {/* Badges Section */}
                <div className="bg-card p-5 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-bold text-foreground">{t('profile.myBadges')}</h3>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {badges.map((badge) => {
                            // Mock Logic for Unlocking
                            let isUnlocked = false;
                            if (badge.id === 'start' && (user?.total_xp || 0) > 0) isUnlocked = true;
                            if (badge.id === 'week_streak' && (user?.streak_days || 0) >= 7) isUnlocked = true;
                            if (badge.id === 'master' && (user?.total_xp || 0) >= 1000) isUnlocked = true;

                            // For demo purposes, unlock 'start' always if user exists
                            if (badge.id === 'start') isUnlocked = true;

                            return (
                                <div key={badge.id} className="flex flex-col items-center gap-1 group relative">
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all
                                        ${isUnlocked ? badge.color + ' shadow-md' : 'bg-secondary/50 grayscale opacity-50'}
                                    `}>
                                        {badge.icon}
                                    </div>
                                    <span className="text-[10px] text-center font-medium leading-tight line-clamp-2 max-w-[60px]">
                                        {t(`profile.badges.${badge.key}.name` as string)}
                                    </span>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 border border-border">
                                        {t(`profile.badges.${badge.key}.desc` as string)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Edit & Logout */}
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-secondary/30 rounded-2xl hover:bg-secondary/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <Edit3 className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-foreground">{t('profile.edit')}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="font-medium text-red-600">{t('settings.items.logout')}</span>
                        </div>
                    </button>
                </div>
            </div>


        </div>
    );
}

function Flame(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0 1.1.2 2.2.5 3.3a9 9 0 0 0 2-7.8Z" />
        </svg>
    )
}
