import {
    TIME_THRESHOLDS,
    DIFFICULTY_LEVELS,
    DIFFICULTY_LABELS,
    DIFFICULTY_COLORS,
    DAF_DEFAULTS,
    METRONOME_DEFAULTS,
    GAMIFICATION,
    PREMIUM_PLANS,
    STORAGE_KEYS,
} from '@/lib/constants';

describe('Constants', () => {
    describe('TIME_THRESHOLDS', () => {
        it('should have correct morning end hour', () => {
            expect(TIME_THRESHOLDS.MORNING_END).toBe(12);
        });

        it('should have correct afternoon end hour', () => {
            expect(TIME_THRESHOLDS.AFTERNOON_END).toBe(18);
        });
    });

    describe('DIFFICULTY_LEVELS', () => {
        it('should have all difficulty levels defined', () => {
            expect(DIFFICULTY_LEVELS.NONE).toBe(0);
            expect(DIFFICULTY_LEVELS.EASY).toBe(1);
            expect(DIFFICULTY_LEVELS.MEDIUM).toBe(2);
            expect(DIFFICULTY_LEVELS.HARD).toBe(3);
            expect(DIFFICULTY_LEVELS.EXPERT).toBe(4);
        });
    });

    describe('DIFFICULTY_LABELS', () => {
        it('should have labels for all difficulty levels', () => {
            expect(DIFFICULTY_LABELS[0]).toBe('');
            expect(DIFFICULTY_LABELS[1]).toBe('Kolay');
            expect(DIFFICULTY_LABELS[2]).toBe('Orta');
            expect(DIFFICULTY_LABELS[3]).toBe('Zor');
            expect(DIFFICULTY_LABELS[4]).toBe('Uzman');
        });
    });

    describe('DIFFICULTY_COLORS', () => {
        it('should have CSS classes for all difficulty levels', () => {
            expect(DIFFICULTY_COLORS[0]).toBe('');
            expect(DIFFICULTY_COLORS[1]).toContain('emerald');
            expect(DIFFICULTY_COLORS[2]).toContain('amber');
            expect(DIFFICULTY_COLORS[3]).toContain('orange');
            expect(DIFFICULTY_COLORS[4]).toContain('red');
        });
    });

    describe('DAF_DEFAULTS', () => {
        it('should have valid delay range', () => {
            expect(DAF_DEFAULTS.MIN_DELAY_MS).toBeLessThan(DAF_DEFAULTS.MAX_DELAY_MS);
            expect(DAF_DEFAULTS.DEFAULT_DELAY_MS).toBeGreaterThanOrEqual(DAF_DEFAULTS.MIN_DELAY_MS);
            expect(DAF_DEFAULTS.DEFAULT_DELAY_MS).toBeLessThanOrEqual(DAF_DEFAULTS.MAX_DELAY_MS);
        });

        it('should have positive step value', () => {
            expect(DAF_DEFAULTS.STEP_MS).toBeGreaterThan(0);
        });
    });

    describe('METRONOME_DEFAULTS', () => {
        it('should have valid BPM range', () => {
            expect(METRONOME_DEFAULTS.MIN_BPM).toBeLessThan(METRONOME_DEFAULTS.MAX_BPM);
            expect(METRONOME_DEFAULTS.DEFAULT_BPM).toBeGreaterThanOrEqual(METRONOME_DEFAULTS.MIN_BPM);
            expect(METRONOME_DEFAULTS.DEFAULT_BPM).toBeLessThanOrEqual(METRONOME_DEFAULTS.MAX_BPM);
        });

        it('should have beats per measure defined', () => {
            expect(METRONOME_DEFAULTS.BEATS_PER_MEASURE).toBeGreaterThan(0);
        });
    });

    describe('GAMIFICATION', () => {
        it('should have positive XP per minute', () => {
            expect(GAMIFICATION.XP_PER_MINUTE).toBeGreaterThan(0);
        });

        it('should have streak bonus multiplier greater than 1', () => {
            expect(GAMIFICATION.STREAK_BONUS_MULTIPLIER).toBeGreaterThan(1);
        });
    });

    describe('PREMIUM_PLANS', () => {
        it('should have monthly and yearly plans', () => {
            expect(PREMIUM_PLANS.MONTHLY).toBe('monthly');
            expect(PREMIUM_PLANS.YEARLY).toBe('yearly');
        });
    });

    describe('STORAGE_KEYS', () => {
        it('should have unique storage keys', () => {
            const keys = Object.values(STORAGE_KEYS);
            const uniqueKeys = new Set(keys);
            expect(uniqueKeys.size).toBe(keys.length);
        });

        it('should have prefixed storage keys', () => {
            Object.values(STORAGE_KEYS).forEach((key) => {
                expect(key).toContain('konuskoc-');
            });
        });
    });
});
