"use client";

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DailyTask {
    id: string;
    template_id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    task_type: string;
    exercise_type: string | null;
    required_count: number;
    current_progress: number;
    xp_reward: number;
    is_completed: boolean;
    xp_claimed: boolean;
    difficulty: string;
}

interface UseDailyTasksReturn {
    tasks: DailyTask[];
    isLoading: boolean;
    error: string | null;
    completedCount: number;
    totalXP: number;
    fetchTasks: () => Promise<void>;
    updateProgress: (taskId: string, progress: number) => Promise<void>;
    claimReward: (taskId: string) => Promise<number>;
    checkAndCompleteTask: (exerciseType: string, count?: number) => Promise<void>;
}

/**
 * Hook for managing daily tasks.
 * Handles fetching, progress updates, and reward claiming.
 */
export function useDailyTasks(): UseDailyTasksReturn {
    const [tasks, setTasks] = useState<DailyTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useLanguage();

    const langSuffix = language === 'tr' ? '_tr' : language === 'de' ? '_de' : '_en';

    /**
     * Fetch today's tasks for the current user
     */
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            // First, ensure tasks are assigned for today
            await supabase.rpc('assign_daily_tasks', { p_user_id: user.id });

            // Fetch tasks with template info
            const { data, error: fetchError } = await supabase
                .from('user_daily_tasks')
                .select(`
                    id,
                    current_progress,
                    is_completed,
                    xp_claimed,
                    task_template:task_template_id (
                        id,
                        slug,
                        name_tr,
                        name_en,
                        name_de,
                        description_tr,
                        description_en,
                        description_de,
                        icon,
                        task_type,
                        exercise_type,
                        required_count,
                        xp_reward,
                        difficulty
                    )
                `)
                .eq('user_id', user.id)
                .eq('assigned_date', new Date().toISOString().split('T')[0]);

            if (fetchError) throw fetchError;

            // Transform data
            const transformedTasks: DailyTask[] = (data || []).map((item: any) => ({
                id: item.id,
                template_id: item.task_template.id,
                slug: item.task_template.slug,
                name: item.task_template[`name${langSuffix}`] || item.task_template.name_en,
                description: item.task_template[`description${langSuffix}`] || item.task_template.description_en || '',
                icon: item.task_template.icon,
                task_type: item.task_template.task_type,
                exercise_type: item.task_template.exercise_type,
                required_count: item.task_template.required_count,
                current_progress: item.current_progress,
                xp_reward: item.task_template.xp_reward,
                is_completed: item.is_completed,
                xp_claimed: item.xp_claimed,
                difficulty: item.task_template.difficulty,
            }));

            setTasks(transformedTasks);
        } catch (err: any) {
            console.error('Error fetching daily tasks:', err);
            setError('Günlük görevler yüklenemedi');
        } finally {
            setIsLoading(false);
        }
    }, [langSuffix]);

    /**
     * Update task progress
     */
    const updateProgress = useCallback(async (taskId: string, progress: number) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newProgress = Math.min(progress, task.required_count);
            const isCompleted = newProgress >= task.required_count;

            await supabase
                .from('user_daily_tasks')
                .update({
                    current_progress: newProgress,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null,
                })
                .eq('id', taskId);

            // Update local state
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, current_progress: newProgress, is_completed: isCompleted }
                    : t
            ));
        } catch (err) {
            console.error('Error updating task progress:', err);
        }
    }, [tasks]);

    /**
     * Claim XP reward for completed task
     */
    const claimReward = useCallback(async (taskId: string): Promise<number> => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task || !task.is_completed || task.xp_claimed) return 0;

            // Mark as claimed
            await supabase
                .from('user_daily_tasks')
                .update({ xp_claimed: true })
                .eq('id', taskId);

            // Add XP to user stats (try RPC, silently fail if not exists)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                try {
                    await supabase.rpc('add_user_xp', {
                        p_user_id: user.id,
                        p_xp: task.xp_reward
                    });
                } catch {
                    // RPC might not exist yet, XP will be handled elsewhere
                }
            }

            // Update local state
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, xp_claimed: true } : t
            ));

            return task.xp_reward;
        } catch (err) {
            console.error('Error claiming reward:', err);
            return 0;
        }
    }, [tasks]);

    /**
     * Check and complete matching tasks when exercise is done
     */
    const checkAndCompleteTask = useCallback(async (exerciseType: string, count: number = 1) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Find matching tasks
            const matchingTasks = tasks.filter(t =>
                !t.is_completed &&
                (t.exercise_type === null || t.exercise_type === exerciseType)
            );

            for (const task of matchingTasks) {
                const newProgress = task.current_progress + count;
                await updateProgress(task.id, newProgress);
            }
        } catch (err) {
            console.error('Error checking tasks:', err);
        }
    }, [tasks, updateProgress]);

    // Computed values
    const completedCount = tasks.filter(t => t.is_completed).length;
    const totalXP = tasks.reduce((sum, t) => sum + (t.xp_claimed ? t.xp_reward : 0), 0);

    // Fetch on mount
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        error,
        completedCount,
        totalXP,
        fetchTasks,
        updateProgress,
        claimReward,
        checkAndCompleteTask,
    };
}
