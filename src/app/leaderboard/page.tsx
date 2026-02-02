"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Trophy, Flame, Clock, Medal,
    Crown, ChevronUp, ChevronDown, User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LeaderboardPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const {
        leaderboard,
        userStats,
        userRank,
        isLoading,
        period,
        setPeriod
    } = useLeaderboard();

    const periods = [
        { id: 'weekly', label: t('leaderboard.weekly') || 'Haftalık' },
        { id: 'monthly', label: t('leaderboard.monthly') || 'Aylık' },
        { id: 'all_time', label: t('leaderboard.allTime') || 'Tüm Zamanlar' },
    ] as const;

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
            case 2: return <Medal className="w-5 h-5 text-gray-300" />;
            case 3: return <Medal className="w-5 h-5 text-amber-600" />;
            default: return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1: return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
            case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/30';
            case 3: return 'bg-gradient-to-r from-amber-700/20 to-orange-600/20 border-amber-700/30';
            default: return 'bg-card border-border';
        }
    };

    const getXPForPeriod = (entry: any) => {
        switch (period) {
            case 'weekly': return entry.weekly_xp;
            case 'monthly': return entry.monthly_xp;
            default: return entry.total_xp;
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {t('leaderboard.title') || 'Sıralama'}
                    </h1>
                    <div className="w-9" />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* User Stats Card */}
                {userStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-foreground">
                                {t('leaderboard.yourStats') || 'Senin İstatistiklerin'}
                            </h2>
                            {userRank && (
                                <div className="flex items-center gap-1 px-3 py-1 bg-teal-500 rounded-full">
                                    <Trophy className="w-4 h-4 text-white" />
                                    <span className="text-white font-bold text-sm">#{userRank}</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-500">
                                    {period === 'weekly' ? userStats.weekly_xp
                                        : period === 'monthly' ? userStats.monthly_xp
                                            : userStats.total_xp}
                                </div>
                                <div className="text-xs text-muted-foreground">XP</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                                    {userStats.current_streak}
                                    <Flame className="w-5 h-5" />
                                </div>
                                <div className="text-xs text-muted-foreground">{t('progress.streak') || 'Seri'}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-500">
                                    {userStats.total_practice_minutes}
                                </div>
                                <div className="text-xs text-muted-foreground">{t('progress.minutes') || 'Dakika'}</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Period Tabs */}
                <div className="flex bg-secondary rounded-xl p-1">
                    {periods.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${period === p.id
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Leaderboard List */}
                <div className="space-y-3">
                    {isLoading ? (
                        // Skeleton loading
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                                        <div className="h-3 bg-secondary rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('leaderboard.noData') || 'Henüz sıralama verisi yok'}</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.user_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`rounded-xl p-4 border ${getRankBg(index + 1)}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                            {getRankIcon(index + 1)}
                                        </div>

                                        {/* Avatar & Name */}
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                                                {entry.avatar_url ? (
                                                    <img
                                                        src={entry.avatar_url}
                                                        alt={entry.full_name || ''}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {entry.full_name || 'Anonim'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Flame className="w-3 h-3 text-orange-500" />
                                                        {entry.current_streak}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{entry.total_practice_minutes} dk</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* XP */}
                                        <div className="text-right">
                                            <div className="font-bold text-foreground">
                                                {getXPForPeriod(entry).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">XP</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
