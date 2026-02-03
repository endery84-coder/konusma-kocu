"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Achievement {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xp_reward: number;
    requirement_type: string;
    requirement_value: number;
    is_secret: boolean;
    is_earned: boolean;
    earned_at: string | null;
}

interface UseAchievementsReturn {
    achievements: Achievement[];
    earnedCount: number;
    totalCount: number;
    recentAchievements: Achievement[];
    isLoading: boolean;
    error: string | null;
    fetchAchievements: () => Promise<void>;
    checkAchievements: () => Promise<Achievement[]>;
}

/**
 * Hook for managing user achievements/badges.
 * Handles fetching, checking, and awarding achievements.
 */
export function useAchievements(): UseAchievementsReturn {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const langSuffix = language === 'tr' ? '_tr' : language === 'de' ? '_de' : '_en';

    /**
     * Fetch all achievements with user's earned status
     */
    const fetchAchievements = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Fetch all achievements
            const { data: allAchievements, error: fetchError } = await supabase
                .from('achievements')
                .select('*')
                .order('sort_order', { ascending: true });

            if (fetchError) throw fetchError;

            // Fetch user's earned achievements
            let earnedIds: string[] = [];
            let earnedMap: Record<string, string> = {};

            if (user) {
                const { data: userAchievements } = await supabase
                    .from('user_achievements')
                    .select('achievement_id, earned_at')
                    .eq('user_id', user.id);

                if (userAchievements) {
                    earnedIds = userAchievements.map(ua => ua.achievement_id);
                    earnedMap = userAchievements.reduce((acc, ua) => {
                        acc[ua.achievement_id] = ua.earned_at;
                        return acc;
                    }, {} as Record<string, string>);
                }
            }

            // Transform achievements
            const transformed: Achievement[] = (allAchievements || []).map(a => ({
                id: a.id,
                slug: a.slug,
                name: a[`name${langSuffix}`] || a.name_en,
                description: a[`description${langSuffix}`] || a.description_en,
                icon: a.icon,
                category: a.category,
                xp_reward: a.xp_reward,
                requirement_type: a.requirement_type,
                requirement_value: a.requirement_value,
                is_secret: a.is_secret,
                is_earned: earnedIds.includes(a.id),
                earned_at: earnedMap[a.id] || null,
            }));

            setAchievements(transformed);

            // Set recent achievements (earned in last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recent = transformed.filter(a =>
                a.is_earned &&
                a.earned_at &&
                new Date(a.earned_at) > weekAgo
            );
            setRecentAchievements(recent);

        } catch (err: any) {
            console.error('Error fetching achievements:', err);
            setError('Rozetler yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    }, [langSuffix]);

    /**
     * Check and award any new achievements based on user stats
     */
    const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
        const newlyEarned: Achievement[] = [];

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return newlyEarned;

            // Get user stats
            const { data: stats } = await supabase
                .from('user_stats')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!stats) return newlyEarned;

            // Get unearned achievements
            const unearned = achievements.filter(a => !a.is_earned);

            for (const achievement of unearned) {
                let qualifies = false;

                switch (achievement.requirement_type) {
                    case 'streak':
                        qualifies = stats.current_streak >= achievement.requirement_value ||
                            stats.longest_streak >= achievement.requirement_value;
                        break;

                    case 'count':
                        qualifies = stats.total_exercises_completed >= achievement.requirement_value;
                        break;

                    case 'time':
                        qualifies = stats.total_practice_minutes >= achievement.requirement_value;
                        break;

                    case 'special':
                        // Special achievements are checked differently
                        // e.g., early_bird: exercised before 7am
                        // night_owl: exercised after 10pm
                        const hour = new Date().getHours();
                        if (achievement.slug === 'early_bird' && hour < 7) {
                            qualifies = true;
                        } else if (achievement.slug === 'night_owl' && hour >= 22) {
                            qualifies = true;
                        }
                        break;
                }

                if (qualifies) {
                    // Award achievement
                    const { error: insertError } = await supabase
                        .from('user_achievements')
                        .insert({
                            user_id: user.id,
                            achievement_id: achievement.id,
                        });

                    if (!insertError) {
                        newlyEarned.push(achievement);

                        // Update local state
                        setAchievements(prev => prev.map(a =>
                            a.id === achievement.id
                                ? { ...a, is_earned: true, earned_at: new Date().toISOString() }
                                : a
                        ));
                    }
                }
            }

            if (newlyEarned.length > 0) {
                setRecentAchievements(prev => [...newlyEarned, ...prev]);
            }

        } catch (err) {
            console.error('Error checking achievements:', err);
        }

        return newlyEarned;
    }, [achievements]);

    // Computed values
    const earnedCount = achievements.filter(a => a.is_earned).length;
    const totalCount = achievements.filter(a => !a.is_secret || a.is_earned).length;

    // Fetch on mount
    useEffect(() => {
        fetchAchievements();
    }, [fetchAchievements]);

    return {
        achievements,
        earnedCount,
        totalCount,
        recentAchievements,
        isLoading,
        error,
        fetchAchievements,
        checkAchievements,
    };
}
