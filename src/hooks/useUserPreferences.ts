
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase"

/**
 * User preferences hook for managing personalized settings.
 * Fetches and saves user preferences like goals, level, and daily targets.
 * 
 * @param {string} userId - Optional user ID to fetch preferences for
 * @returns {{ preferences: object | null, loading: boolean, savePreferences: function }}
 * @example
 * ```tsx
 * const { preferences, loading, savePreferences } = useUserPreferences(userId);
 * 
 * // Save new preferences
 * await savePreferences({ daily_goal_minutes: 20 });
 * ```
 */
export function useUserPreferences(userId?: string) {
    const [preferences, setPreferences] = useState<Database['public']['Tables']['user_preferences']['Row'] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        async function fetchPreferences() {
            try {
                const { data, error } = await supabase
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', userId)
                    .single()

                if (error && error.code !== 'PGRST116') { // PGRST116 is no rows found
                    // Error handled silently
                }

                if (data) {
                    setPreferences(data)
                }
            } catch {
                // Unexpected error handled silently
            } finally {
                setLoading(false)
            }
        }

        fetchPreferences()
    }, [userId])

    const savePreferences = async (newPrefs: Partial<Database['public']['Tables']['user_preferences']['Insert']>) => {
        if (!userId) return { error: 'No user ID' }

        try {
            // Check if exists first or use upsert
            const { data, error } = await supabase
                .from('user_preferences')
                .upsert({ user_id: userId, ...newPrefs })
                .select()
                .single()

            if (data) setPreferences(data)
            return { data, error }
        } catch (e) {
            return { error: e }
        }
    }

    return { preferences, loading, savePreferences }
}
