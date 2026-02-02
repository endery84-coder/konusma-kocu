"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Clock, Flame, X, Home, RotateCcw } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ExerciseCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry?: () => void;
    onHome?: () => void;
    stats: {
        title: string;
        duration: number; // seconds
        score?: number; // 0-100
        xpEarned?: number;
        streakDay?: number;
        isNewRecord?: boolean;
    };
}

/**
 * Modal displayed when user completes an exercise.
 * Shows stats, XP earned, and celebration animations.
 */
export function ExerciseCompleteModal({
    isOpen,
    onClose,
    onRetry,
    onHome,
    stats,
}: ExerciseCompleteModalProps) {
    const { t } = useLanguage();
    const { fireConfetti, fireStars } = useConfetti();

    useEffect(() => {
        if (isOpen) {
            // Fire confetti on modal open
            setTimeout(() => {
                fireConfetti();
                if (stats.isNewRecord) {
                    setTimeout(fireStars, 500);
                }
            }, 300);
        }
    }, [isOpen, fireConfetti, fireStars, stats.isNewRecord]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-orange-500';
    };

    const getScoreEmoji = (score: number) => {
        if (score >= 90) return '🌟';
        if (score >= 70) return '👍';
        if (score >= 50) return '💪';
        return '🎯';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Trophy Icon */}
                        <div className="flex justify-center mb-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                            >
                                <Trophy className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center mb-6"
                        >
                            <h2 className="text-2xl font-bold text-foreground mb-1">
                                {t('common.congrats')} 🎉
                            </h2>
                            <p className="text-muted-foreground">
                                {stats.title} {t('exercises.completed') || 'completed'}!
                            </p>
                        </motion.div>

                        {/* Stats Grid */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-3 mb-6"
                        >
                            {/* Duration */}
                            <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                                <div className="text-lg font-bold text-foreground">
                                    {formatDuration(stats.duration)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t('exercises.time') || 'Time'}
                                </div>
                            </div>

                            {/* Score */}
                            {stats.score !== undefined && (
                                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                                    <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                                    <div className={`text-lg font-bold ${getScoreColor(stats.score)}`}>
                                        {stats.score}% {getScoreEmoji(stats.score)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('exercises.analysis.score') || 'Score'}
                                    </div>
                                </div>
                            )}

                            {/* XP Earned */}
                            {stats.xpEarned !== undefined && (
                                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: 2, duration: 0.5 }}
                                        className="text-lg font-bold text-purple-500"
                                    >
                                        +{stats.xpEarned} XP
                                    </motion.div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('progress.xp') || 'Experience'}
                                    </div>
                                </div>
                            )}

                            {/* Streak */}
                            {stats.streakDay !== undefined && stats.streakDay > 0 && (
                                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-4 text-center">
                                    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                                    <div className="text-lg font-bold text-orange-500">
                                        {stats.streakDay} 🔥
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {t('progress.streak') || 'Day Streak'}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* New Record Badge */}
                        {stats.isNewRecord && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mb-6 py-2 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-center text-white font-bold text-sm"
                            >
                                🏆 {t('exercises.newRecord') || 'New Personal Record!'}
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-3"
                        >
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="flex-1 py-3 px-4 rounded-xl bg-secondary text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t('exercises.breathing.again') || 'Again'}
                                </button>
                            )}
                            {onHome && (
                                <button
                                    onClick={onHome}
                                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    {t('nav.home') || 'Home'}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
