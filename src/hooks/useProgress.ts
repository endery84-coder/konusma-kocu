
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase"

export function useProgress(userId: string) {
    const [progress, setProgress] = useState({
        streakDays: 0,
        weeklyMinutes: 0,
        completedExercises: 0,
        weeklyData: [] as any[], // Typing to fix quickly
        categoryProgress: [] as any[],
        recentActivities: [] as any[],
        achievements: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProgress = async () => {
            if (!userId) {
                setLoading(false)
                return
            }

            // Streak ve toplam
            const { data: user } = await supabase
                .from('users')
                .select('streak_days, total_practice_minutes')
                .eq('id', userId)
                .single();

            // Calculate week start
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

            const { data: weeklyProgress } = await supabase
                .from('user_progress')
                .select('completed_at, duration_seconds, exercise_id')
                .eq('user_id', userId)
                .gte('completed_at', weekStart.toISOString());

            // Kategori bazlı ilerleme
            const { data: exercises } = await supabase
                .from('exercises')
                .select('id, category');

            // Son aktiviteler
            const { data: recent } = await supabase
                .from('user_progress')
                .select(`
          *,
          exercises (title, icon, category)
        `)
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(5);

            // Başarılar
            const { data: achievements } = await supabase
                .from('user_achievements')
                .select(`
          *,
          achievements (*)
        `)
                .eq('user_id', userId);

            // Process Weekly Data needed for Chart
            // Mocking weekly structure for now or implementing logic
            const weeklyDataStruct = [
                { day: 'Pzt', minutes: 0 },
                { day: 'Sal', minutes: 0 },
                { day: 'Çar', minutes: 0 },
                { day: 'Per', minutes: 0 },
                { day: 'Cum', minutes: 0 },
                { day: 'Cmt', minutes: 0 },
                { day: 'Paz', minutes: 0 },
            ]

            if (weeklyProgress) {
                weeklyProgress.forEach(p => {
                    if (p.completed_at && p.duration_seconds) {
                        const d = new Date(p.completed_at)
                        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1 // 0 is Sunday, make it 6. 1 is Monday, make it 0.
                        if (weeklyDataStruct[dayIndex]) {
                            weeklyDataStruct[dayIndex].minutes += Math.round(p.duration_seconds / 60)
                        }
                    }
                })
            }

            // Calculate Category Progress
            // For demo, random or calculated
            const cats = exercises ? Array.from(new Set(exercises.map(e => e.category))) : []
            const categoryProgressData = cats.map(c => ({
                category: c,
                percentage: 0 // Logic needed to calculate based on total available vs completed
            }))

            setProgress({
                streakDays: user?.streak_days || 0,
                weeklyMinutes: weeklyProgress ? Math.round(weeklyProgress.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) / 60) : 0,
                completedExercises: weeklyProgress?.length || 0,
                weeklyData: weeklyDataStruct,
                categoryProgress: categoryProgressData,
                recentActivities: recent || [],
                achievements: achievements || []
            });
            setLoading(false)
        };

        fetchProgress();
    }, [userId]);

    return { progress, loading };
}
