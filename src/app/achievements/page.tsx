"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Trophy, Lock, Sparkles,
    Flame, Target, Clock, Star, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAchievements } from '@/hooks/useAchievements';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AchievementsPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const {
        achievements,
        earnedCount,
        totalCount,
        recentAchievements,
        isLoading
    } = useAchievements();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: t('achievements.all') || 'Tümü', icon: Trophy },
        { id: 'streak', label: t('achievements.streak') || 'Seri', icon: Flame },
        { id: 'exercise', label: t('achievements.exercise') || 'Egzersiz', icon: Target },
        { id: 'time', label: t('achievements.time') || 'Zaman', icon: Clock },
        { id: 'special', label: t('achievements.special') || 'Özel', icon: Star },
        { id: 'social', label: t('achievements.social') || 'Sosyal', icon: Users },
    ];

    const filteredAchievements = selectedCategory === 'all'
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    const progressPercentage = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        {t('achievements.title') || 'Başarılar'}
                    </h1>
                    <div className="w-9" />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Progress Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-semibold text-foreground text-lg">
                                {t('achievements.collection') || 'Rozet Koleksiyonu'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {earnedCount}/{totalCount} {t('achievements.unlocked') || 'rozet açıldı'}
                            </p>
                        </div>
                        <div className="w-16 h-16 relative">
                            <svg className="w-16 h-16 -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-amber-500/20"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-amber-500"
                                    strokeDasharray={176}
                                    strokeDashoffset={176 - (progressPercentage / 100) * 176}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                                {Math.round(progressPercentage)}%
                            </span>
                        </div>
                    </div>

                    {/* Recent Achievements */}
                    {recentAchievements.length > 0 && (
                        <div className="pt-4 border-t border-amber-500/20">
                            <p className="text-xs text-amber-600 mb-2 font-medium">
                                {t('achievements.recent') || 'Son Kazanılan'}
                            </p>
                            <div className="flex gap-2">
                                {recentAchievements.slice(0, 4).map((a) => (
                                    <div
                                        key={a.id}
                                        className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl"
                                        title={a.name}
                                    >
                                        {a.icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {isLoading ? (
                        // Skeleton
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3" />
                                <div className="h-4 bg-secondary rounded w-2/3 mx-auto mb-2" />
                                <div className="h-3 bg-secondary rounded w-1/2 mx-auto" />
                            </div>
                        ))
                    ) : filteredAchievements.length === 0 ? (
                        <div className="col-span-2 text-center py-12 text-muted-foreground">
                            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('achievements.none') || 'Bu kategoride rozet bulunamadı'}</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredAchievements.map((achievement, index) => (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`relative rounded-2xl p-4 text-center border transition-all ${achievement.is_earned
                                            ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30'
                                            : 'bg-card border-border opacity-60'
                                        }`}
                                >
                                    {/* Lock overlay for unearned */}
                                    {!achievement.is_earned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-2xl">
                                            <Lock className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl ${achievement.is_earned
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                                            : 'bg-secondary'
                                        }`}>
                                        {achievement.is_earned ? (
                                            achievement.icon
                                        ) : (
                                            <span className="grayscale opacity-50">{achievement.icon}</span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 className={`font-semibold text-sm mb-1 ${achievement.is_earned ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {achievement.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {achievement.description}
                                    </p>

                                    {/* XP Badge */}
                                    {achievement.is_earned && (
                                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full text-xs text-amber-600 font-medium">
                                            <Sparkles className="w-3 h-3" />
                                            +{achievement.xp_reward} XP
                                        </div>
                                    )}

                                    {/* Earned Date */}
                                    {achievement.is_earned && achievement.earned_at && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {new Date(achievement.earned_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
