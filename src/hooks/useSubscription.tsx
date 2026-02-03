"use client";

import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

// Free tier limits
export const FREE_LIMITS = {
    exercisesPerDay: 3,
    dafMinutesPerDay: 5,
    recordingSecondsPerDay: 30,
    recordingsPerDay: 3,
} as const;

// Premium benefits
export const PREMIUM_BENEFITS = {
    unlimitedExercises: true,
    unlimitedDAF: true,
    unlimitedRecordings: true,
    advancedAnalysis: true,
    streakFreezes: 2,
    noAds: true,
    prioritySupport: true,
    familySharing: 4,
} as const;

interface Subscription {
    plan_type: 'free' | 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'expired' | 'trial';
    trial_ends_at: string | null;
    current_period_end: string | null;
    streak_freezes_remaining: number;
}

interface DailyUsage {
    exercises_completed: number;
    daf_minutes_used: number;
    recordings_count: number;
    recording_seconds_used: number;
}

interface UseSubscriptionReturn {
    subscription: Subscription | null;
    usage: DailyUsage;
    isPremium: boolean;
    isTrialing: boolean;
    trialDaysLeft: number;
    isLoading: boolean;
    error: string | null;

    // Limit checks
    canDoExercise: boolean;
    canUseDAF: boolean;
    canRecord: boolean;

    // Actions
    fetchSubscription: () => Promise<void>;
    incrementUsage: (type: 'exercise' | 'daf' | 'recording', amount?: number) => Promise<void>;
    useStreakFreeze: () => Promise<boolean>;
    startTrial: () => Promise<boolean>;

    // Limits remaining
    exercisesRemaining: number;
    dafMinutesRemaining: number;
    recordingSecondsRemaining: number;
}

/**
 * Hook for managing user subscription and usage limits.
 * Provides paywall checks and premium status.
 */
export function useSubscription(): UseSubscriptionReturn {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<DailyUsage>({
        exercises_completed: 0,
        daf_minutes_used: 0,
        recordings_count: 0,
        recording_seconds_used: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch subscription and usage data
     */
    const fetchSubscription = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            // Fetch subscription
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (subData) {
                setSubscription({
                    plan_type: subData.plan_type,
                    status: subData.status,
                    trial_ends_at: subData.trial_ends_at,
                    current_period_end: subData.current_period_end,
                    streak_freezes_remaining: subData.streak_freezes_remaining || 0,
                });
            } else {
                // Create free subscription
                const { data: newSub } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: user.id,
                        plan_type: 'free',
                        status: 'active',
                    })
                    .select()
                    .single();

                if (newSub) {
                    setSubscription({
                        plan_type: 'free',
                        status: 'active',
                        trial_ends_at: null,
                        current_period_end: null,
                        streak_freezes_remaining: 0,
                    });
                }
            }

            // Fetch today's usage
            const today = new Date().toISOString().split('T')[0];
            const { data: usageData } = await supabase
                .from('daily_usage')
                .select('*')
                .eq('user_id', user.id)
                .eq('usage_date', today)
                .single();

            if (usageData) {
                setUsage({
                    exercises_completed: usageData.exercises_completed,
                    daf_minutes_used: usageData.daf_minutes_used,
                    recordings_count: usageData.recordings_count,
                    recording_seconds_used: usageData.recording_seconds_used,
                });
            } else {
                // Initialize today's usage
                await supabase
                    .from('daily_usage')
                    .insert({
                        user_id: user.id,
                        usage_date: today,
                    });
            }

        } catch (err: any) {
            console.error('Error fetching subscription:', err);
            setError('Abonelik bilgisi alınamadı');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Increment usage counter
     */
    const incrementUsage = useCallback(async (type: 'exercise' | 'daf' | 'recording', amount: number = 1) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            const updateField = type === 'exercise' ? 'exercises_completed'
                : type === 'daf' ? 'daf_minutes_used'
                    : 'recordings_count';

            // Upsert usage
            await supabase
                .from('daily_usage')
                .upsert({
                    user_id: user.id,
                    usage_date: today,
                    [updateField]: usage[updateField as keyof DailyUsage] + amount,
                }, {
                    onConflict: 'user_id,usage_date',
                });

            // Update local state
            setUsage(prev => ({
                ...prev,
                [updateField]: prev[updateField as keyof DailyUsage] + amount,
            }));

        } catch (err) {
            console.error('Error updating usage:', err);
        }
    }, [usage]);

    /**
     * Use a streak freeze
     */
    const useStreakFreeze = useCallback(async (): Promise<boolean> => {
        if (!subscription || subscription.streak_freezes_remaining <= 0) {
            return false;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            await supabase
                .from('subscriptions')
                .update({
                    streak_freezes_remaining: subscription.streak_freezes_remaining - 1,
                })
                .eq('user_id', user.id);

            setSubscription(prev => prev ? {
                ...prev,
                streak_freezes_remaining: prev.streak_freezes_remaining - 1,
            } : null);

            return true;
        } catch (err) {
            console.error('Error using streak freeze:', err);
            return false;
        }
    }, [subscription]);

    /**
     * Start 7-day trial
     */
    const startTrial = useCallback(async (): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 7);

            await supabase
                .from('subscriptions')
                .update({
                    status: 'trial',
                    trial_ends_at: trialEnd.toISOString(),
                    streak_freezes_remaining: 2,
                })
                .eq('user_id', user.id);

            setSubscription(prev => prev ? {
                ...prev,
                status: 'trial',
                trial_ends_at: trialEnd.toISOString(),
                streak_freezes_remaining: 2,
            } : null);

            return true;
        } catch (err) {
            console.error('Error starting trial:', err);
            return false;
        }
    }, []);

    // Computed values
    const isPremium = subscription?.plan_type !== 'free' &&
        subscription?.status === 'active';

    const isTrialing = subscription?.status === 'trial' &&
        subscription?.trial_ends_at != null &&
        new Date(subscription.trial_ends_at) > new Date();

    const trialDaysLeft = isTrialing && subscription?.trial_ends_at
        ? Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    const hasPremiumAccess = isPremium || isTrialing;

    // Limit checks
    const exercisesRemaining = hasPremiumAccess
        ? Infinity
        : Math.max(0, FREE_LIMITS.exercisesPerDay - usage.exercises_completed);

    const dafMinutesRemaining = hasPremiumAccess
        ? Infinity
        : Math.max(0, FREE_LIMITS.dafMinutesPerDay - usage.daf_minutes_used);

    const recordingSecondsRemaining = hasPremiumAccess
        ? Infinity
        : Math.max(0, FREE_LIMITS.recordingSecondsPerDay - usage.recording_seconds_used);

    const canDoExercise = hasPremiumAccess || usage.exercises_completed < FREE_LIMITS.exercisesPerDay;
    const canUseDAF = hasPremiumAccess || usage.daf_minutes_used < FREE_LIMITS.dafMinutesPerDay;
    const canRecord = hasPremiumAccess || usage.recording_seconds_used < FREE_LIMITS.recordingSecondsPerDay;

    // Fetch on mount
    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    return {
        subscription,
        usage,
        isPremium,
        isTrialing,
        trialDaysLeft,
        isLoading,
        error,
        canDoExercise,
        canUseDAF,
        canRecord,
        fetchSubscription,
        incrementUsage,
        useStreakFreeze,
        startTrial,
        exercisesRemaining,
        dafMinutesRemaining,
        recordingSecondsRemaining,
    };
}

// Context for global access
const SubscriptionContext = createContext<UseSubscriptionReturn | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const subscription = useSubscription();

    return (
        <SubscriptionContext.Provider value= { subscription } >
        { children }
        </SubscriptionContext.Provider>
    );
}

export function useSubscriptionContext() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
    }
    return context;
}
