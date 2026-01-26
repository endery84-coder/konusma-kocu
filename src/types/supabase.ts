export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            achievements: {
                Row: {
                    description: string | null
                    icon: string | null
                    id: string
                    requirement_type: string | null
                    requirement_value: number | null
                    title: string | null
                }
                Insert: {
                    description?: string | null
                    icon?: string | null
                    id?: string
                    requirement_type?: string | null
                    requirement_value?: number | null
                    title?: string | null
                }
                Update: {
                    description?: string | null
                    icon?: string | null
                    id?: string
                    requirement_type?: string | null
                    requirement_value?: number | null
                    title?: string | null
                }
                Relationships: []
            }
            exercises: {
                Row: {
                    category: string | null
                    description: string | null
                    difficulty: number | null
                    duration_minutes: number | null
                    icon: string | null
                    id: string
                    instructions: string | null
                    is_premium: boolean | null
                    order_index: number | null
                    target_goals: string[] | null
                    title: string
                }
                Insert: {
                    category?: string | null
                    description?: string | null
                    difficulty?: number | null
                    duration_minutes?: number | null
                    icon?: string | null
                    id?: string
                    instructions?: string | null
                    is_premium?: boolean | null
                    order_index?: number | null
                    target_goals?: string[] | null
                    title: string
                }
                Update: {
                    category?: string | null
                    description?: string | null
                    difficulty?: number | null
                    duration_minutes?: number | null
                    icon?: string | null
                    id?: string
                    instructions?: string | null
                    is_premium?: boolean | null
                    order_index?: number | null
                    target_goals?: string[] | null
                    title: string
                }
                Relationships: []
            }
            recordings: {
                Row: {
                    ai_feedback: Json | null
                    audio_url: string | null
                    created_at: string | null
                    duration_seconds: number | null
                    exercise_id: string | null
                    id: string
                    transcript: string | null
                    user_id: string | null
                }
                Insert: {
                    ai_feedback?: Json | null
                    audio_url?: string | null
                    created_at?: string | null
                    duration_seconds?: number | null
                    exercise_id?: string | null
                    id?: string
                    transcript?: string | null
                    user_id?: string | null
                }
                Update: {
                    ai_feedback?: Json | null
                    audio_url?: string | null
                    created_at?: string | null
                    duration_seconds?: number | null
                    exercise_id?: string | null
                    id?: string
                    transcript?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "recordings_exercise_id_fkey"
                        columns: ["exercise_id"]
                        isOneToOne: false
                        referencedRelation: "exercises"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "recordings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_achievements: {
                Row: {
                    achievement_id: string | null
                    id: string
                    unlocked_at: string | null
                    user_id: string | null
                }
                Insert: {
                    achievement_id?: string | null
                    id?: string
                    unlocked_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    achievement_id?: string | null
                    id?: string
                    unlocked_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_achievement_id_fkey"
                        columns: ["achievement_id"]
                        isOneToOne: false
                        referencedRelation: "achievements"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_achievements_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_preferences: {
                Row: {
                    challenges: string[] | null
                    created_at: string | null
                    daily_goal_minutes: number | null
                    experience_level: string | null
                    goals: string[] | null
                    id: string
                    onboarding_completed: boolean | null
                    onboarding_completed_at: string | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    challenges?: string[] | null
                    created_at?: string | null
                    daily_goal_minutes?: number | null
                    experience_level?: string | null
                    goals?: string[] | null
                    id?: string
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    challenges?: string[] | null
                    created_at?: string | null
                    daily_goal_minutes?: number | null
                    experience_level?: string | null
                    goals?: string[] | null
                    id?: string
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_preferences_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_progress: {
                Row: {
                    completed_at: string | null
                    duration_seconds: number | null
                    exercise_id: string | null
                    id: string
                    notes: string | null
                    score: number | null
                    user_id: string | null
                }
                Insert: {
                    completed_at?: string | null
                    duration_seconds?: number | null
                    exercise_id?: string | null
                    id?: string
                    notes?: string | null
                    score?: number | null
                    user_id?: string | null
                }
                Update: {
                    completed_at?: string | null
                    duration_seconds?: number | null
                    exercise_id?: string | null
                    id?: string
                    notes?: string | null
                    score?: number | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_exercise_id_fkey"
                        columns: ["exercise_id"]
                        isOneToOne: false
                        referencedRelation: "exercises"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string | null
                    full_name: string | null
                    id: string
                    is_premium: boolean | null
                    streak_days: number | null
                    total_practice_minutes: number | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id: string
                    is_premium?: boolean | null
                    streak_days?: number | null
                    total_practice_minutes?: number | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string | null
                    full_name?: string | null
                    id?: string
                    is_premium?: boolean | null
                    streak_days?: number | null
                    total_practice_minutes?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
