
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Database } from "@/types/supabase" // I need to make sure types are saved, I haven't saved them to a file yet! 
// Wait, I got the types in step 152 but didn't write them to a file. I should write them to src/types/supabase.ts first.

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
                    console.error('Error fetching preferences:', error)
                }

                if (data) {
                    setPreferences(data)
                }
            } catch (e) {
                console.error('Unexpected error:', e)
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
