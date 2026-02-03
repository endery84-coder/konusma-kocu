"use client";

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useDailyTasks } from './useDailyTasks';
import { useAchievements } from './useAchievements';
import { useLeaderboard } from './useLeaderboard';
import { useSubscription } from './useSubscription';
import { useConfetti } from './useConfetti';
import { toast } from 'sonner';

interface ExerciseCompletionData {
    exerciseType: string;
    durationMinutes?: number;
    score?: number;
    xpEarned?: number;
}

interface UseExerciseCompletionReturn {
    completeExercise: (data: ExerciseCompletionData) => Promise<{
        xpEarned: number;
        newAchievements: any[];
        tasksCompleted: number;
    }>;
    canStartExercise: (exerciseType: string) => boolean;
}

/**
 * Hook that handles all side effects when an exercise is completed.
 * Updates daily tasks, achievements, leaderboard stats, and usage limits.
 */
export function useExerciseCompletion(): UseExerciseCompletionReturn {
    const { checkAndCompleteTask, fetchTasks } = useDailyTasks();
    const { checkAchievements } = useAchievements();
    const { addXP } = useLeaderboard();
    const { incrementUsage, canDoExercise, canUseDAF } = useSubscription();
    const { fireConfetti, fireEmoji } = useConfetti();

    /**
     * Complete an exercise and trigger all related updates
     */
    const completeExercise = useCallback(async (data: ExerciseCompletionData): Promise<{
        xpEarned: number;
        newAchievements: any[];
        tasksCompleted: number;
    }> => {
        const { exerciseType, durationMinutes = 0, score, xpEarned = 25 } = data;

        let totalXP = xpEarned;
        const newAchievements: any[] = [];
        let tasksCompleted = 0;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { xpEarned: 0, newAchievements: [], tasksCompleted: 0 };
            }

            // 1. Update usage (for paywall limits)
            await incrementUsage('exercise');

            if (exerciseType === 'daf' && durationMinutes > 0) {
                await incrementUsage('daf', durationMinutes);
            }

            // 2. Update daily tasks
            await checkAndCompleteTask(exerciseType, 1);

            // Check time-based tasks
            if (durationMinutes > 0) {
                // This will be checked against time-based tasks
                await checkAndCompleteTask('time', durationMinutes);
            }

            await fetchTasks();

            // 3. Add XP to leaderboard stats
            await addXP(totalXP, durationMinutes);

            // 4. Check for new achievements
            const earned = await checkAchievements();
            newAchievements.push(...earned);

            // 5. Bonus XP for achievements
            if (earned.length > 0) {
                const achievementXP = earned.reduce((sum, a) => sum + (a.xp_reward || 0), 0);
                totalXP += achievementXP;

                // Show achievement notifications
                earned.forEach((achievement) => {
                    toast.success(`🏆 ${achievement.name}`, {
                        description: `+${achievement.xp_reward} XP kazandın!`,
                        duration: 5000,
                    });
                });

                fireEmoji('🏆');
            }

            // 6. Celebration effects
            if (score && score >= 80) {
                fireConfetti();
            }

            // 7. Update user_progress in database
            await supabase
                .from('user_progress')
                .insert({
                    user_id: user.id,
                    exercise_type: exerciseType,
                    duration_seconds: durationMinutes * 60,
                    score: score || null,
                    xp_earned: totalXP,
                    completed_at: new Date().toISOString(),
                });

            // 8. Update user streak (simplified)
            try {
                await supabase.rpc('update_user_streak', { p_user_id: user.id });
            } catch {
                // RPC might not exist
            }

            return {
                xpEarned: totalXP,
                newAchievements,
                tasksCompleted,
            };

        } catch (error) {
            console.error('Error completing exercise:', error);
            return { xpEarned: 0, newAchievements: [], tasksCompleted: 0 };
        }
    }, [checkAndCompleteTask, fetchTasks, checkAchievements, addXP, incrementUsage, fireConfetti, fireEmoji]);

    /**
     * Check if user can start an exercise (based on limits)
     */
    const canStartExercise = useCallback((exerciseType: string): boolean => {
        if (exerciseType === 'daf') {
            return canUseDAF;
        }
        return canDoExercise;
    }, [canDoExercise, canUseDAF]);

    return {
        completeExercise,
        canStartExercise,
    };
}
