/**
 * Application Constants
 * Magic numbers and strings should be defined here
 */

// Time thresholds for greeting
export const TIME_THRESHOLDS = {
    MORNING_END: 12,
    AFTERNOON_END: 18,
} as const;

// Difficulty levels
export const DIFFICULTY_LEVELS = {
    NONE: 0,
    EASY: 1,
    MEDIUM: 2,
    HARD: 3,
    EXPERT: 4,
} as const;

export const DIFFICULTY_LABELS: Record<number, string> = {
    [DIFFICULTY_LEVELS.NONE]: '',
    [DIFFICULTY_LEVELS.EASY]: 'Kolay',
    [DIFFICULTY_LEVELS.MEDIUM]: 'Orta',
    [DIFFICULTY_LEVELS.HARD]: 'Zor',
    [DIFFICULTY_LEVELS.EXPERT]: 'Uzman',
};

export const DIFFICULTY_COLORS: Record<number, string> = {
    [DIFFICULTY_LEVELS.NONE]: '',
    [DIFFICULTY_LEVELS.EASY]: 'text-emerald-500',
    [DIFFICULTY_LEVELS.MEDIUM]: 'text-amber-500',
    [DIFFICULTY_LEVELS.HARD]: 'text-orange-500',
    [DIFFICULTY_LEVELS.EXPERT]: 'text-red-500',
};

// Exercise categories
export const EXERCISE_CATEGORIES = {
    ALL: 'all',
    NEFES: 'nefes',
    AKICILIK: 'akicilik',
    OKUMA: 'okuma',
    TELAFFUZ: 'telaffuz',
    SUNUM: 'sunum',
    COCUK: 'cocuk',
} as const;

// DAF defaults
export const DAF_DEFAULTS = {
    MIN_DELAY_MS: 50,
    MAX_DELAY_MS: 300,
    DEFAULT_DELAY_MS: 100,
    STEP_MS: 10,
} as const;

// Metronome defaults
export const METRONOME_DEFAULTS = {
    MIN_BPM: 40,
    MAX_BPM: 120,
    DEFAULT_BPM: 60,
    STEP_BPM: 5,
    BEATS_PER_MEASURE: 4,
} as const;

// UI Constants
export const UI_CONSTANTS = {
    MOBILE_MAX_WIDTH: 430,
    NOTIFICATION_REQUEST_DELAY_MS: 5000,
    TOAST_DURATION_MS: 3000,
    ANIMATION_DURATION_MS: 300,
} as const;

// Audio recording limits
export const AUDIO_LIMITS = {
    MAX_RECORDING_DURATION_SEC: 300, // 5 minutes
    COUNTDOWN_DURATION_SEC: 3,
} as const;

// XP and gamification
export const GAMIFICATION = {
    XP_PER_MINUTE: 10,
    STREAK_BONUS_MULTIPLIER: 1.5,
    DAILY_GOAL_MINUTES_DEFAULT: 10,
} as const;

// Premium plan IDs
export const PREMIUM_PLANS = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    LANGUAGE: 'konuskoc-language',
    THEME: 'konuskoc-theme',
    USER_PREFERENCES: 'konuskoc-user-prefs',
    LAST_SYNC: 'konuskoc-last-sync',
} as const;

// API endpoints (if needed)
export const API_ROUTES = {
    SEED: '/api/seed',
} as const;
