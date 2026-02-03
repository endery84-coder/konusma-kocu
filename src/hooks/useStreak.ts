"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastPracticeDate: string | null;
    freezesRemaining: number;
    freezeUsedToday: boolean;
    streakAtRisk: boolean;
}

interface UseStreakReturn {
    streak: StreakInfo;
    isLoading: boolean;
    updateStreak: () => Promise<void>;
    useStreakFreeze: () => Promise<boolean>;
    checkStreakStatus: () => Promise<void>;
}

/**
 * Hook for managing user streaks and streak freeze functionality
 */
export function useStreak(): UseStreakReturn {
    const [streak, setStreak] = useState<StreakInfo>({
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        freezesRemaining: 0,
        freezeUsedToday: false,
        streakAtRisk: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check if a date is today
     */
    const isToday = (dateStr: string | null): boolean => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    /**
     * Check if a date is yesterday
     */
    const isYesterday = (dateStr: string | null): boolean => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()
        );
    };

    /**
     * Fetch current streak status
     */
    const checkStreakStatus = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user stats
            const { data: stats } = await supabase
                .from('user_stats')
                .select('current_streak, longest_streak, last_practice_date')
                .eq('user_id', user.id)
                .single();

            // Get subscription for freeze count
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('streak_freezes_remaining')
                .eq('user_id', user.id)
                .single();

            // Check if freeze was used today
            const { data: freezeLog } = await supabase
                .from('streak_freeze_logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('used_date', new Date().toISOString().split('T')[0])
                .single();

            const lastPracticeDate = stats?.last_practice_date;
            const practicedToday = isToday(lastPracticeDate);
            const practicedYesterday = isYesterday(lastPracticeDate);

            // Streak is at risk if: not practiced today AND not practiced yesterday AND streak > 0
            const streakAtRisk = !practicedToday && !practicedYesterday && (stats?.current_streak || 0) > 0;

            setStreak({
                currentStreak: stats?.current_streak || 0,
                longestStreak: stats?.longest_streak || 0,
                lastPracticeDate: lastPracticeDate || null,
                freezesRemaining: subscription?.streak_freezes_remaining || 0,
                freezeUsedToday: !!freezeLog,
                streakAtRisk,
            });
        } catch (error) {
            console.error('Error checking streak:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update streak after exercise completion
     */
    const updateStreak = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            // Get current stats
            const { data: stats } = await supabase
                .from('user_stats')
                .select('current_streak, longest_streak, last_practice_date')
                .eq('user_id', user.id)
                .single();

            if (!stats) {
                // Create new stats record
                await supabase.from('user_stats').insert({
                    user_id: user.id,
                    current_streak: 1,
                    longest_streak: 1,
                    last_practice_date: today,
                });
                setStreak(prev => ({ ...prev, currentStreak: 1, longestStreak: 1, lastPracticeDate: today }));
                return;
            }

            // Already practiced today
            if (isToday(stats.last_practice_date)) {
                return;
            }

            let newStreak = 1;

            // If practiced yesterday, increment streak
            if (isYesterday(stats.last_practice_date)) {
                newStreak = (stats.current_streak || 0) + 1;
            }

            const newLongest = Math.max(newStreak, stats.longest_streak || 0);

            await supabase
                .from('user_stats')
                .update({
                    current_streak: newStreak,
                    longest_streak: newLongest,
                    last_practice_date: today,
                })
                .eq('user_id', user.id);

            setStreak(prev => ({
                ...prev,
                currentStreak: newStreak,
                longestStreak: newLongest,
                lastPracticeDate: today,
                streakAtRisk: false,
            }));

        } catch (error) {
            console.error('Error updating streak:', error);
        }
    }, []);

    /**
     * Use a streak freeze to save the streak
     */
    const useStreakFreeze = useCallback(async (): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // Check if user has freezes remaining
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('streak_freezes_remaining')
                .eq('user_id', user.id)
                .single();

            if (!subscription || subscription.streak_freezes_remaining <= 0) {
                return false;
            }

            const today = new Date().toISOString().split('T')[0];

            // Check if already used today
            const { data: existingFreeze } = await supabase
                .from('streak_freeze_logs')
                .select('id')
                .eq('user_id', user.id)
                .eq('used_date', today)
                .single();

            if (existingFreeze) {
                return false; // Already used today
            }

            // Use the freeze
            await supabase
                .from('subscriptions')
                .update({ streak_freezes_remaining: subscription.streak_freezes_remaining - 1 })
                .eq('user_id', user.id);

            // Log the freeze usage
            await supabase.from('streak_freeze_logs').insert({
                user_id: user.id,
                used_date: today,
            });

            // Update last_practice_date to preserve streak
            await supabase
                .from('user_stats')
                .update({ last_practice_date: today })
                .eq('user_id', user.id);

            setStreak(prev => ({
                ...prev,
                freezesRemaining: prev.freezesRemaining - 1,
                freezeUsedToday: true,
                streakAtRisk: false,
            }));

            return true;
        } catch (error) {
            console.error('Error using streak freeze:', error);
            return false;
        }
    }, []);

    // Load on mount
    useEffect(() => {
        checkStreakStatus();
    }, [checkStreakStatus]);

    return {
        streak,
        isLoading,
        updateStreak,
        useStreakFreeze,
        checkStreakStatus,
    };
}
