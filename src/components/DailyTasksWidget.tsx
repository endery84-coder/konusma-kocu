"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, ChevronRight, Sparkles } from 'lucide-react';
import { useDailyTasks } from '@/hooks/useDailyTasks';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useConfetti } from '@/hooks/useConfetti';

interface DailyTasksWidgetProps {
    expanded?: boolean;
    onViewAll?: () => void;
}

/**
 * Widget displaying daily tasks on home page.
 * Shows progress and allows claiming rewards.
 */
export function DailyTasksWidget({ expanded = false, onViewAll }: DailyTasksWidgetProps) {
    const { t } = useLanguage();
    const { tasks, completedCount, claimReward, isLoading } = useDailyTasks();
    const { fireConfetti, fireEmoji } = useConfetti();

    const handleClaimReward = async (taskId: string) => {
        const xp = await claimReward(taskId);
        if (xp > 0) {
            fireEmoji('🎁');
            fireConfetti();
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
            case 'hard': return 'bg-rose-500/20 text-rose-500 border-rose-500/30';
            default: return 'bg-primary/20 text-primary border-primary/30';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return t('common.easy') || 'Kolay';
            case 'medium': return t('common.medium') || 'Orta';
            case 'hard': return t('common.hard') || 'Zor';
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-card rounded-2xl p-4 border border-border animate-pulse">
                <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 bg-secondary rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (tasks.length === 0) {
        return null;
    }

    const displayTasks = expanded ? tasks : tasks.slice(0, 3);
    const allCompleted = completedCount === tasks.length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${allCompleted
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                            : 'bg-primary/10'
                        }`}>
                        {allCompleted
                            ? <Sparkles className="w-4 h-4 text-white" />
                            : <Gift className="w-4 h-4 text-primary" />
                        }
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">
                            {t('dailyTasks.title') || 'Günlük Görevler'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {completedCount}/{tasks.length} {t('dailyTasks.completed') || 'tamamlandı'}
                        </p>
                    </div>
                </div>

                {/* Progress ring */}
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-secondary"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-primary"
                            strokeDasharray={100}
                            strokeDashoffset={100 - (completedCount / tasks.length) * 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {completedCount}
                    </span>
                </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-2">
                <AnimatePresence>
                    {displayTasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${task.is_completed
                                    ? 'bg-emerald-500/10'
                                    : 'bg-secondary/50 hover:bg-secondary'
                                }`}
                        >
                            {/* Icon */}
                            <div className="text-2xl">{task.icon}</div>

                            {/* Task info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-medium truncate ${task.is_completed ? 'text-emerald-600 line-through' : 'text-foreground'
                                        }`}>
                                        {task.name}
                                    </p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getDifficultyColor(task.difficulty)}`}>
                                        {getDifficultyLabel(task.difficulty)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {/* Progress bar */}
                                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(task.current_progress / task.required_count) * 100}%` }}
                                            className={`h-full rounded-full ${task.is_completed ? 'bg-emerald-500' : 'bg-primary'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {task.current_progress}/{task.required_count}
                                    </span>
                                </div>
                            </div>

                            {/* Reward/Complete */}
                            {task.is_completed ? (
                                task.xp_claimed ? (
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                ) : (
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleClaimReward(task.id)}
                                        className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-500/30"
                                    >
                                        +{task.xp_reward} XP
                                    </motion.button>
                                )
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    +{task.xp_reward} XP
                                </span>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* View all button */}
            {!expanded && onViewAll && tasks.length > 3 && (
                <button
                    onClick={onViewAll}
                    className="w-full p-3 border-t border-border text-primary text-sm font-medium flex items-center justify-center gap-1 hover:bg-secondary/50 transition-colors"
                >
                    {t('dailyTasks.viewAll') || 'Tüm Görevleri Gör'}
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* All completed celebration */}
            {allCompleted && (
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-t border-amber-500/20 text-center">
                    <p className="text-amber-600 font-medium text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t('dailyTasks.allDone') || 'Harika! Bugünkü tüm görevleri tamamladın!'}
                        <Sparkles className="w-4 h-4" />
                    </p>
                </div>
            )}
        </motion.div>
    );
}
