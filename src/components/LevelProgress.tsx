"use client";

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useLevel } from '@/hooks/useLevel';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface LevelBadgeProps {
    totalXP: number;
    size?: 'sm' | 'md' | 'lg';
    showTitle?: boolean;
}

/**
 * Compact level badge showing level number and icon
 */
export function LevelBadge({ totalXP, size = 'md', showTitle = false }: LevelBadgeProps) {
    const { language } = useLanguage();
    const levelInfo = useLevel(totalXP);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center font-bold text-white shadow-lg`}
            >
                {levelInfo.level}
            </div>
            {showTitle && (
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {levelInfo.title[language as keyof typeof levelInfo.title] || levelInfo.title.en}
                    </p>
                    <p className="text-xs text-muted-foreground">{levelInfo.icon}</p>
                </div>
            )}
        </div>
    );
}

interface LevelProgressProps {
    totalXP: number;
    showDetails?: boolean;
    compact?: boolean;
}

/**
 * Level progress bar with XP information
 */
export function LevelProgress({ totalXP, showDetails = true, compact = false }: LevelProgressProps) {
    const { language, t } = useLanguage();
    const levelInfo = useLevel(totalXP);

    return (
        <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
            {/* Level Info Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{levelInfo.icon}</span>
                    <div>
                        <span className={`font-bold ${compact ? 'text-sm' : 'text-base'} text-foreground`}>
                            {t('level.level') || 'Seviye'} {levelInfo.level}
                        </span>
                        {!compact && (
                            <span className="text-muted-foreground text-sm ml-2">
                                {levelInfo.title[language as keyof typeof levelInfo.title] || levelInfo.title.en}
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <span className={`font-bold ${compact ? 'text-sm' : 'text-base'} bg-gradient-to-r ${levelInfo.color} bg-clip-text text-transparent`}>
                        {totalXP.toLocaleString()} XP
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
                <div className={`w-full ${compact ? 'h-2' : 'h-3'} bg-secondary rounded-full overflow-hidden`}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progressToNextLevel}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${levelInfo.color} rounded-full relative`}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </motion.div>
                </div>

                {/* Percentage indicator */}
                {!compact && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-1 transform -translate-y-full"
                        style={{ left: `${Math.min(90, levelInfo.progressToNextLevel)}%` }}
                    >
                        <div className="bg-card border border-border rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm">
                            {Math.round(levelInfo.progressToNextLevel)}%
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Details */}
            {showDetails && !levelInfo.isMaxLevel && (
                <p className="text-xs text-muted-foreground text-center">
                    {levelInfo.xpNeededForNext.toLocaleString()} XP {t('level.toNextLevel') || 'sonraki seviye için'}
                </p>
            )}

            {levelInfo.isMaxLevel && (
                <p className="text-xs text-amber-500 font-medium text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('level.maxLevel') || 'Maksimum seviyeye ulaştın!'}
                    <Sparkles className="w-3 h-3" />
                </p>
            )}
        </div>
    );
}

interface LevelCardProps {
    totalXP: number;
    streak?: number;
    exercisesCompleted?: number;
}

/**
 * Full level card for profile page
 */
export function LevelCard({ totalXP, streak = 0, exercisesCompleted = 0 }: LevelCardProps) {
    const { language, t } = useLanguage();
    const levelInfo = useLevel(totalXP);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${levelInfo.color} rounded-2xl p-5 text-white shadow-xl relative overflow-hidden`}
        >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Level Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{levelInfo.icon}</div>
                    <div>
                        <p className="text-white/80 text-sm">{t('level.level') || 'Seviye'}</p>
                        <p className="text-4xl font-bold">{levelInfo.level}</p>
                        <p className="text-white/90 font-medium">
                            {levelInfo.title[language as keyof typeof levelInfo.title] || levelInfo.title.en}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-white/80">{t('level.progress') || 'İlerleme'}</span>
                        <span className="font-bold">{Math.round(levelInfo.progressToNextLevel)}%</span>
                    </div>
                    <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${levelInfo.progressToNextLevel}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-white/90 rounded-full"
                        />
                    </div>
                    {!levelInfo.isMaxLevel && (
                        <p className="text-sm text-white/70 text-center">
                            {levelInfo.xpNeededForNext.toLocaleString()} XP {t('level.remaining') || 'kaldı'}
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                        <p className="text-xs text-white/70">XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{streak}</p>
                        <p className="text-xs text-white/70">🔥 {t('progress.streak') || 'Seri'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{exercisesCompleted}</p>
                        <p className="text-xs text-white/70">🎯 {t('progress.exercises') || 'Egzersiz'}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
