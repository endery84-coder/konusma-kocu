"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    total_xp: number;
    weekly_xp: number;
    monthly_xp: number;
    current_streak: number;
    total_practice_minutes: number;
    weekly_rank: number;
    monthly_rank: number;
    all_time_rank: number;
}

interface UserStats {
    total_xp: number;
    weekly_xp: number;
    monthly_xp: number;
    current_streak: number;
    longest_streak: number;
    total_practice_minutes: number;
    total_exercises_completed: number;
    weekly_rank?: number;
    monthly_rank?: number;
}

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

interface UseLeaderboardReturn {
    leaderboard: LeaderboardEntry[];
    userStats: UserStats | null;
    userRank: number | null;
    isLoading: boolean;
    error: string | null;
    period: LeaderboardPeriod;
    setPeriod: (period: LeaderboardPeriod) => void;
    fetchLeaderboard: () => Promise<void>;
    addXP: (amount: number, practiceMinutes?: number) => Promise<void>;
}

/**
 * Hook for managing leaderboard data and user stats.
 * Provides ranking, XP tracking, and streak management.
 */
export function useLeaderboard(): UseLeaderboardReturn {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');

    /**
     * Fetch leaderboard data from Supabase
     */
    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch top 50 users for leaderboard
            const orderColumn = period === 'weekly' ? 'weekly_xp'
                : period === 'monthly' ? 'monthly_xp'
                    : 'total_xp';

            const { data: leaderboardData, error: leaderboardError } = await supabase
                .from('user_stats')
                .select(`
                    user_id,
                    total_xp,
                    weekly_xp,
                    monthly_xp,
                    current_streak,
                    total_practice_minutes,
                    users:user_id (
                        raw_user_meta_data
                    )
                `)
                .order(orderColumn, { ascending: false })
                .limit(50);

            if (leaderboardError) throw leaderboardError;

            // Transform data
            const transformedLeaderboard: LeaderboardEntry[] = (leaderboardData || []).map((entry: any, index: number) => ({
                user_id: entry.user_id,
                full_name: entry.users?.raw_user_meta_data?.full_name || 'Anonim',
                avatar_url: entry.users?.raw_user_meta_data?.avatar_url || null,
                total_xp: entry.total_xp,
                weekly_xp: entry.weekly_xp,
                monthly_xp: entry.monthly_xp,
                current_streak: entry.current_streak,
                total_practice_minutes: entry.total_practice_minutes,
                weekly_rank: index + 1,
                monthly_rank: index + 1,
                all_time_rank: index + 1,
            }));

            setLeaderboard(transformedLeaderboard);

            // Find current user's stats and rank
            if (user) {
                const userEntry = transformedLeaderboard.find(e => e.user_id === user.id);
                if (userEntry) {
                    const rankKey = period === 'weekly' ? 'weekly_rank'
                        : period === 'monthly' ? 'monthly_rank'
                            : 'all_time_rank';
                    setUserRank(userEntry[rankKey]);
                    setUserStats({
                        total_xp: userEntry.total_xp,
                        weekly_xp: userEntry.weekly_xp,
                        monthly_xp: userEntry.monthly_xp,
                        current_streak: userEntry.current_streak,
                        longest_streak: 0, // Would need separate query
                        total_practice_minutes: userEntry.total_practice_minutes,
                        total_exercises_completed: 0, // Would need separate query
                    });
                } else {
                    // User not in top 50, fetch their stats separately
                    const { data: userStatsData } = await supabase
                        .from('user_stats')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (userStatsData) {
                        setUserStats({
                            total_xp: userStatsData.total_xp,
                            weekly_xp: userStatsData.weekly_xp,
                            monthly_xp: userStatsData.monthly_xp,
                            current_streak: userStatsData.current_streak,
                            longest_streak: userStatsData.longest_streak,
                            total_practice_minutes: userStatsData.total_practice_minutes,
                            total_exercises_completed: userStatsData.total_exercises_completed,
                        });
                        setUserRank(null); // Not in top 50
                    }
                }
            }
        } catch (err: any) {
            console.error('Error fetching leaderboard:', err);
            setError('Sıralama yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    }, [period]);

    /**
     * Add XP and update stats after completing an exercise
     */
    const addXP = useCallback(async (amount: number, practiceMinutes: number = 0) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            // Check if user has stats record
            const { data: existingStats } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (existingStats) {
                // Update existing stats
                const lastPractice = existingStats.last_practice_date;
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                // Calculate streak
                let newStreak = existingStats.current_streak;
                if (lastPractice === yesterdayStr) {
                    newStreak += 1; // Continue streak
                } else if (lastPractice !== today) {
                    newStreak = 1; // Reset streak
                }

                const longestStreak = Math.max(existingStats.longest_streak, newStreak);

                await supabase
                    .from('user_stats')
                    .update({
                        total_xp: existingStats.total_xp + amount,
                        weekly_xp: existingStats.weekly_xp + amount,
                        monthly_xp: existingStats.monthly_xp + amount,
                        total_practice_minutes: existingStats.total_practice_minutes + practiceMinutes,
                        weekly_practice_minutes: existingStats.weekly_practice_minutes + practiceMinutes,
                        total_exercises_completed: existingStats.total_exercises_completed + 1,
                        current_streak: newStreak,
                        longest_streak: longestStreak,
                        last_practice_date: today,
                    })
                    .eq('user_id', user.id);
            } else {
                // Create new stats record
                await supabase
                    .from('user_stats')
                    .insert({
                        user_id: user.id,
                        total_xp: amount,
                        weekly_xp: amount,
                        monthly_xp: amount,
                        total_practice_minutes: practiceMinutes,
                        weekly_practice_minutes: practiceMinutes,
                        total_exercises_completed: 1,
                        current_streak: 1,
                        longest_streak: 1,
                        last_practice_date: today,
                    });
            }

            // Refresh stats
            await fetchLeaderboard();
        } catch (err) {
            console.error('Error adding XP:', err);
        }
    }, [fetchLeaderboard]);

    // Fetch on mount
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return {
        leaderboard,
        userStats,
        userRank,
        isLoading,
        error,
        period,
        setPeriod,
        fetchLeaderboard,
        addXP,
    };
}
