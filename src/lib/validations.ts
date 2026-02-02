/**
 * Zod validation schemas for form inputs and API data
 * Following security.md guidelines for input validation
 */

import { z } from 'zod';

// ============================================
// User Related Schemas
// ============================================

/**
 * User profile update schema
 */
export const userProfileSchema = z.object({
    display_name: z.string()
        .min(2, 'İsim en az 2 karakter olmalı')
        .max(50, 'İsim en fazla 50 karakter olabilir')
        .optional(),
    avatar_url: z.string().url('Geçerli bir URL olmalı').optional().nullable(),
});

/**
 * User preferences schema
 */
const goals = ['kekemelik', 'akicilik', 'telaffuz', 'genel'] as const;
const levels = ['cocuk', 'yetiskin', 'ileri'] as const;

export const userPreferencesSchema = z.object({
    goal: z.enum(goals).optional(),
    level: z.enum(levels).optional(),
    daily_goal_minutes: z.number()
        .min(5, 'Günlük hedef en az 5 dakika olmalı')
        .max(120, 'Günlük hedef en fazla 120 dakika olabilir')
        .optional(),
});

// ============================================
// Exercise Related Schemas
// ============================================

/**
 * Exercise completion schema
 */
export const exerciseCompletionSchema = z.object({
    exercise_id: z.string().uuid('Geçerli bir egzersiz ID\'si gerekli'),
    duration_seconds: z.number()
        .min(0, 'Süre negatif olamaz')
        .max(3600, 'Süre en fazla 1 saat olabilir'),
    score: z.number()
        .min(0, 'Puan negatif olamaz')
        .max(100, 'Puan en fazla 100 olabilir')
        .optional(),
});

// ============================================
// Audio/Recording Schemas
// ============================================

/**
 * DAF settings schema
 */
export const dafSettingsSchema = z.object({
    delayMs: z.number()
        .min(50, 'Gecikme en az 50ms olmalı')
        .max(300, 'Gecikme en fazla 300ms olabilir'),
});

/**
 * Metronome settings schema
 */
export const metronomeSettingsSchema = z.object({
    bpm: z.number()
        .min(40, 'BPM en az 40 olmalı')
        .max(120, 'BPM en fazla 120 olabilir'),
});

// ============================================
// Auth Related Schemas
// ============================================

/**
 * Email validation schema
 */
export const emailSchema = z.string()
    .email('Geçerli bir e-posta adresi girin')
    .min(5, 'E-posta çok kısa')
    .max(254, 'E-posta çok uzun');

/**
 * Password validation schema (for future use)
 */
export const passwordSchema = z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(128, 'Şifre en fazla 128 karakter olabilir')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli');

// ============================================
// Feedback/Contact Schemas
// ============================================

/**
 * Contact form schema
 */
const subjects = ['genel', 'teknik', 'oneri', 'sikayet'] as const;

export const contactFormSchema = z.object({
    name: z.string()
        .min(2, 'İsim en az 2 karakter olmalı')
        .max(100, 'İsim en fazla 100 karakter olabilir'),
    email: emailSchema,
    message: z.string()
        .min(10, 'Mesaj en az 10 karakter olmalı')
        .max(1000, 'Mesaj en fazla 1000 karakter olabilir'),
    subject: z.enum(subjects),
});

// ============================================
// Type Exports
// ============================================

export type UserProfile = z.infer<typeof userProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ExerciseCompletion = z.infer<typeof exerciseCompletionSchema>;
export type DafSettings = z.infer<typeof dafSettingsSchema>;
export type MetronomeSettings = z.infer<typeof metronomeSettingsSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
